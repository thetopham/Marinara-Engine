import type { GameLocation, GameLocationLink } from "../types/game-location.js";

export interface LocationGraphLocation extends GameLocation {
  archived?: boolean;
  hidden?: boolean;
  blocked?: boolean;
  links?: readonly LocationGraphLink[];
}

export interface LocationGraphLink extends Omit<GameLocationLink, "fromLocationId" | "toLocationId"> {
  fromLocationId?: string;
  toLocationId: string;
  bidirectional?: boolean;
  archived?: boolean;
  hidden?: boolean;
  blocked?: boolean;
}

export interface ValidateGameLocationGraphOptions {
  links?: readonly LocationGraphLink[];
  currentLocationId?: string | null;
  startingLocationId?: string | null;
  maxLocations?: number;
  maxDepth?: number;
  maxLinksPerLocation?: number;
  maxTotalLinks?: number;
}

export type GameLocationGraphIssueCode =
  | "duplicate_location_id"
  | "duplicate_link_id"
  | "missing_parent"
  | "missing_link_source"
  | "missing_link_target"
  | "self_parent"
  | "parent_cycle"
  | "max_locations_exceeded"
  | "max_depth_exceeded"
  | "max_links_per_location_exceeded"
  | "max_total_links_exceeded"
  | "invalid_current_location"
  | "invalid_starting_location";

export interface GameLocationGraphIssue {
  code: GameLocationGraphIssueCode;
  message: string;
  locationId?: string;
  linkId?: string;
  targetId?: string;
  limit?: number;
  actual?: number;
}

export interface ValidateGameLocationGraphResult {
  valid: boolean;
  issues: GameLocationGraphIssue[];
}

export interface ResolveLocationAncestryResult {
  currentLocation: LocationGraphLocation | null;
  ancestors: LocationGraphLocation[];
  path: LocationGraphLocation[];
}

export interface ResolvedLocationDestination {
  location: LocationGraphLocation;
  via: "parent" | "child" | "link" | "reverse_bidirectional_link";
  link?: LocationGraphLink;
}

export interface MovementValidationResult {
  valid: boolean;
  reason?: "missing_current" | "missing_destination" | "archived" | "hidden" | "blocked" | "non_adjacent";
  message?: string;
  destination?: ResolvedLocationDestination;
}

function collectLinks(locations: readonly LocationGraphLocation[], links: readonly LocationGraphLink[] = []): LocationGraphLink[] {
  const collected = [...links];
  for (const location of locations) {
    for (const link of location.links ?? []) collected.push({ ...link, fromLocationId: link.fromLocationId ?? location.id });
  }
  return collected;
}

function isLocationActive(location: LocationGraphLocation | undefined): location is LocationGraphLocation {
  return !!location && !location.archived && !location.hidden && !location.blocked;
}

function isLinkActive(link: LocationGraphLink): boolean {
  return link.enabled !== false && !link.archived && !link.hidden && !link.blocked;
}

function indexLocations(locations: readonly LocationGraphLocation[]): Map<string, LocationGraphLocation> {
  return new Map(locations.map((location) => [location.id, location]));
}

export function validateGameLocationGraph(
  locations: readonly LocationGraphLocation[],
  options: ValidateGameLocationGraphOptions = {},
): ValidateGameLocationGraphResult {
  const issues: GameLocationGraphIssue[] = [];
  const ids = new Set<string>();
  const duplicateIds = new Set<string>();

  for (const location of locations) {
    if (ids.has(location.id)) duplicateIds.add(location.id);
    ids.add(location.id);
  }
  for (const id of duplicateIds) {
    issues.push({ code: "duplicate_location_id", message: `Duplicate location id: ${id}`, locationId: id });
  }

  if (options.maxLocations !== undefined && locations.length > options.maxLocations) {
    issues.push({
      code: "max_locations_exceeded",
      message: `Location count ${locations.length} exceeds limit ${options.maxLocations}`,
      limit: options.maxLocations,
      actual: locations.length,
    });
  }

  for (const location of locations) {
    const parentId = location.parentId ?? null;
    if (!parentId) continue;
    if (parentId === location.id) {
      issues.push({ code: "self_parent", message: `Location ${location.id} cannot parent itself`, locationId: location.id });
    } else if (!ids.has(parentId)) {
      issues.push({ code: "missing_parent", message: `Location ${location.id} references missing parent ${parentId}`, locationId: location.id, targetId: parentId });
    }
  }

  const links = collectLinks(locations, options.links);
  const linkIds = new Set<string>();
  const duplicateLinkIds = new Set<string>();
  const linkCountBySource = new Map<string, number>();
  for (const link of links) {
    if (link.id) {
      if (linkIds.has(link.id)) duplicateLinkIds.add(link.id);
      linkIds.add(link.id);
    }
    const fromId = link.fromLocationId;
    if (!fromId || !ids.has(fromId)) {
      issues.push({ code: "missing_link_source", message: `Link ${link.id} references missing source ${fromId ?? "(none)"}`, linkId: link.id, targetId: fromId });
    } else {
      linkCountBySource.set(fromId, (linkCountBySource.get(fromId) ?? 0) + 1);
    }
    if (!ids.has(link.toLocationId)) {
      issues.push({ code: "missing_link_target", message: `Link ${link.id} references missing target ${link.toLocationId}`, linkId: link.id, targetId: link.toLocationId });
    }
  }
  for (const id of duplicateLinkIds) issues.push({ code: "duplicate_link_id", message: `Duplicate link id: ${id}`, linkId: id });

  if (options.maxTotalLinks !== undefined && links.length > options.maxTotalLinks) {
    issues.push({ code: "max_total_links_exceeded", message: `Link count ${links.length} exceeds limit ${options.maxTotalLinks}`, limit: options.maxTotalLinks, actual: links.length });
  }
  if (options.maxLinksPerLocation !== undefined) {
    for (const [locationId, count] of linkCountBySource) {
      if (count > options.maxLinksPerLocation) issues.push({ code: "max_links_per_location_exceeded", message: `Location ${locationId} has ${count} links, exceeding limit ${options.maxLinksPerLocation}`, locationId, limit: options.maxLinksPerLocation, actual: count });
    }
  }

  const byId = indexLocations(locations);
  const cycleReported = new Set<string>();
  for (const location of locations) {
    const seen = new Set<string>();
    let cursor: LocationGraphLocation | undefined = location;
    let depth = 0;
    while (cursor?.parentId) {
      depth += 1;
      if (options.maxDepth !== undefined && depth > options.maxDepth) {
        issues.push({ code: "max_depth_exceeded", message: `Location ${location.id} depth ${depth} exceeds limit ${options.maxDepth}`, locationId: location.id, limit: options.maxDepth, actual: depth });
        break;
      }
      if (seen.has(cursor.id)) {
        if (!cycleReported.has(location.id)) {
          issues.push({ code: "parent_cycle", message: `Parent cycle detected from location ${location.id}`, locationId: location.id });
          cycleReported.add(location.id);
        }
        break;
      }
      seen.add(cursor.id);
      cursor = byId.get(cursor.parentId);
    }
  }

  if (options.currentLocationId && !ids.has(options.currentLocationId)) {
    issues.push({ code: "invalid_current_location", message: `Current location ${options.currentLocationId} does not exist`, targetId: options.currentLocationId });
  }
  if (options.startingLocationId && !ids.has(options.startingLocationId)) {
    issues.push({ code: "invalid_starting_location", message: `Starting location ${options.startingLocationId} does not exist`, targetId: options.startingLocationId });
  }

  return { valid: issues.length === 0, issues };
}

export function resolveLocationAncestry(
  locations: readonly LocationGraphLocation[],
  currentLocationId: string | null | undefined,
): ResolveLocationAncestryResult {
  const byId = indexLocations(locations);
  const currentLocation = currentLocationId ? (byId.get(currentLocationId) ?? null) : null;
  const ancestors: LocationGraphLocation[] = [];
  const seen = new Set<string>();
  let cursor = currentLocation;
  while (cursor?.parentId && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    const parent = byId.get(cursor.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    cursor = parent;
  }
  return { currentLocation, ancestors, path: currentLocation ? [...ancestors, currentLocation] : [] };
}

export function resolveAvailableDestinations(
  locations: readonly LocationGraphLocation[],
  currentLocationId: string | null | undefined,
  options: Pick<ValidateGameLocationGraphOptions, "links"> = {},
): ResolvedLocationDestination[] {
  const byId = indexLocations(locations);
  const current = currentLocationId ? byId.get(currentLocationId) : undefined;
  if (!isLocationActive(current)) return [];

  const destinations = new Map<string, ResolvedLocationDestination>();
  const add = (destination: LocationGraphLocation | undefined, via: ResolvedLocationDestination["via"], link?: LocationGraphLink) => {
    if (!isLocationActive(destination) || destination.id === current.id || destinations.has(destination.id)) return;
    destinations.set(destination.id, link ? { location: destination, via, link } : { location: destination, via });
  };

  add(current.parentId ? byId.get(current.parentId) : undefined, "parent");
  for (const location of locations) if (location.parentId === current.id) add(location, "child");

  for (const link of collectLinks(locations, options.links)) {
    if (!isLinkActive(link)) continue;
    if (link.fromLocationId === current.id) add(byId.get(link.toLocationId), "link", link);
    if (link.bidirectional && link.toLocationId === current.id && link.fromLocationId) add(byId.get(link.fromLocationId), "reverse_bidirectional_link", link);
  }

  return [...destinations.values()];
}

export function validateGameLocationMovement(
  locations: readonly LocationGraphLocation[],
  currentLocationId: string | null | undefined,
  destinationLocationId: string | null | undefined,
  options: Pick<ValidateGameLocationGraphOptions, "links"> = {},
): MovementValidationResult {
  const byId = indexLocations(locations);
  const current = currentLocationId ? byId.get(currentLocationId) : undefined;
  if (!isLocationActive(current)) return { valid: false, reason: "missing_current", message: "Current location is missing or inactive." };
  const destination = destinationLocationId ? byId.get(destinationLocationId) : undefined;
  if (!destination) return { valid: false, reason: "missing_destination", message: "Destination location does not exist." };
  if (destination.archived) return { valid: false, reason: "archived", message: "Destination location is archived." };
  if (destination.hidden) return { valid: false, reason: "hidden", message: "Destination location is hidden." };
  if (destination.blocked) return { valid: false, reason: "blocked", message: "Destination location is blocked." };

  const adjacent = resolveAvailableDestinations(locations, current.id, options).find((entry) => entry.location.id === destination.id);
  if (!adjacent) return { valid: false, reason: "non_adjacent", message: "Destination is not adjacent to the current location." };
  return { valid: true, destination: adjacent };
}
