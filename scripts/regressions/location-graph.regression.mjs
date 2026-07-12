import assert from "node:assert/strict";
import {
  resolveAvailableDestinations,
  resolveLocationAncestry,
  validateGameLocationGraph,
  validateGameLocationMovement,
} from "../../packages/shared/dist/utils/location-graph.js";

const baseLocations = [
  { id: "world", name: "World" },
  { id: "town", parentId: "world", name: "Town" },
  { id: "tavern", parentId: "town", name: "Tavern" },
  { id: "forest", parentId: "world", name: "Forest" },
  { id: "tower", parentId: "world", name: "Tower" },
];
const baseLinks = [
  { id: "town-forest", fromLocationId: "town", toLocationId: "forest" },
  { id: "tower-town", fromLocationId: "tower", toLocationId: "town", bidirectional: true },
];

assert.equal(validateGameLocationGraph(baseLocations, { links: baseLinks, currentLocationId: "town", startingLocationId: "world" }).valid, true);

assert.deepEqual(
  resolveLocationAncestry(baseLocations, "tavern").path.map((location) => location.id),
  ["world", "town", "tavern"],
);

assert.deepEqual(
  resolveAvailableDestinations(baseLocations, "town", { links: baseLinks })
    .map((entry) => `${entry.via}:${entry.location.id}`)
    .sort(),
  ["child:tavern", "link:forest", "parent:world", "reverse_bidirectional_link:tower"],
);

assert.equal(validateGameLocationMovement(baseLocations, "town", "forest", { links: baseLinks }).valid, true);
assert.equal(validateGameLocationMovement(baseLocations, "forest", "town", { links: baseLinks }).reason, "non_adjacent");
assert.equal(validateGameLocationMovement(baseLocations, "town", "tower", { links: baseLinks }).valid, true);

const hiddenBlockedArchived = [
  ...baseLocations,
  { id: "hidden", parentId: "town", name: "Hidden", hidden: true },
  { id: "blocked", parentId: "town", name: "Blocked", blocked: true },
  { id: "archived", parentId: "town", name: "Archived", archived: true },
];
assert.equal(validateGameLocationMovement(hiddenBlockedArchived, "town", "hidden").reason, "hidden");
assert.equal(validateGameLocationMovement(hiddenBlockedArchived, "town", "blocked").reason, "blocked");
assert.equal(validateGameLocationMovement(hiddenBlockedArchived, "town", "archived").reason, "archived");
assert.equal(
  resolveAvailableDestinations(hiddenBlockedArchived, "town").some((entry) => ["hidden", "blocked", "archived"].includes(entry.location.id)),
  false,
);

assert.equal(validateGameLocationMovement(baseLocations, "town", "tower", { links: [{ ...baseLinks[1], hidden: true }] }).reason, "non_adjacent");
assert.equal(validateGameLocationMovement(baseLocations, "town", "tower", { links: [{ ...baseLinks[1], blocked: true }] }).reason, "non_adjacent");

const cyclic = [
  { id: "a", parentId: "c", name: "A" },
  { id: "b", parentId: "a", name: "B" },
  { id: "c", parentId: "b", name: "C" },
];
assert.equal(validateGameLocationGraph(cyclic).issues.some((issue) => issue.code === "parent_cycle"), true);

const invalid = validateGameLocationGraph(
  [
    { id: "dup", name: "One" },
    { id: "dup", name: "Two" },
    { id: "self", parentId: "self", name: "Self" },
    { id: "orphan", parentId: "missing", name: "Orphan" },
  ],
  { links: [{ id: "bad", fromLocationId: "dup", toLocationId: "missing" }], currentLocationId: "nowhere", startingLocationId: "missing" },
);
for (const code of ["duplicate_location_id", "self_parent", "missing_parent", "missing_link_target", "invalid_current_location", "invalid_starting_location"]) {
  assert.equal(invalid.issues.some((issue) => issue.code === code), true, code);
}

assert.equal(validateGameLocationGraph(baseLocations, { links: baseLinks, maxLocations: 4 }).issues[0]?.code, "max_locations_exceeded");
assert.equal(validateGameLocationGraph(baseLocations, { maxDepth: 1 }).issues.some((issue) => issue.code === "max_depth_exceeded"), true);
assert.equal(validateGameLocationGraph(baseLocations, { links: baseLinks, maxTotalLinks: 1 }).issues[0]?.code, "max_total_links_exceeded");
assert.equal(validateGameLocationGraph(baseLocations, { links: baseLinks, maxLinksPerLocation: 0 }).issues.some((issue) => issue.code === "max_links_per_location_exceeded"), true);

const renamed = baseLocations.map((location) => (location.id === "town" ? { ...location, name: "Renamed Town" } : location));
assert.deepEqual(resolveAvailableDestinations(renamed, "town", { links: baseLinks }).map((entry) => entry.location.id).sort(), ["forest", "tavern", "tower", "world"]);
const reparented = baseLocations.map((location) => (location.id === "tavern" ? { ...location, parentId: "forest" } : location));
assert.deepEqual(resolveAvailableDestinations(reparented, "town", { links: baseLinks }).map((entry) => entry.location.id).sort(), ["forest", "tower", "world"]);
