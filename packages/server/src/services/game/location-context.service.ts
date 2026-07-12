import type { GameLocation } from "@marinara-engine/shared";

const MAX_TEXT_LENGTH = 700;
const MAX_BREADCRUMBS = 8;
const MAX_DESTINATIONS = 12;
const MAX_LOCATION_CONTEXT_CHARS = 2_400;

export type LocationContextMetadata = {
  gameLocations?: unknown;
  currentGameLocationId?: unknown;
  gameLocationRevision?: unknown;
};

type NormalizedLocation = {
  id: string;
  parentId: string | null;
  name: string;
  description: string;
  state?: string;
  sortOrder: number;
};

function normalizeText(value: unknown, maxLength = MAX_TEXT_LENGTH): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength).trim();
}

function normalizeId(value: unknown): string | null {
  const id = normalizeText(value, 160);
  return id || null;
}

function normalizeSortOrder(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

function normalizeLocations(value: unknown): NormalizedLocation[] {
  if (!Array.isArray(value)) return [];

  const locations: NormalizedLocation[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const candidate = raw as Partial<GameLocation>;
    const id = normalizeId(candidate.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const name = normalizeText(candidate.name, 180) || id;
    const parentId = normalizeId(candidate.parentId);
    locations.push({
      id,
      parentId: parentId === id ? null : parentId,
      name,
      description: normalizeText(candidate.description),
      state: normalizeText(candidate.state, 80) || undefined,
      sortOrder: normalizeSortOrder(candidate.sortOrder),
    });
  }

  const ids = new Set(locations.map((location) => location.id));
  return locations
    .map((location) => ({ ...location, parentId: location.parentId && ids.has(location.parentId) ? location.parentId : null }))
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
}

function resolveCurrentLocation(
  locations: NormalizedLocation[],
  currentGameLocationId: unknown,
): NormalizedLocation | null {
  if (locations.length === 0) return null;
  const byId = new Map(locations.map((location) => [location.id, location]));
  const requestedId = normalizeId(currentGameLocationId);
  if (requestedId && byId.has(requestedId)) return byId.get(requestedId) ?? null;
  return locations.find((location) => location.state === "current") ?? null;
}

function resolveBreadcrumbs(current: NormalizedLocation, byId: Map<string, NormalizedLocation>): NormalizedLocation[] {
  const path: NormalizedLocation[] = [];
  const visited = new Set<string>();
  let cursor: NormalizedLocation | undefined = current;

  while (cursor && !visited.has(cursor.id) && path.length < MAX_BREADCRUMBS) {
    path.push(cursor);
    visited.add(cursor.id);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return path.reverse();
}

function resolveAvailableDestinations(
  current: NormalizedLocation,
  locations: NormalizedLocation[],
  byId: Map<string, NormalizedLocation>,
): NormalizedLocation[] {
  const destinations = new Map<string, NormalizedLocation>();
  const parent = current.parentId ? byId.get(current.parentId) : null;
  if (parent) destinations.set(parent.id, parent);

  for (const location of locations) {
    if (location.parentId === current.id) destinations.set(location.id, location);
  }

  for (const location of locations) {
    if (current.parentId && location.parentId === current.parentId && location.id !== current.id) {
      destinations.set(location.id, location);
    }
  }

  return [...destinations.values()]
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .slice(0, MAX_DESTINATIONS);
}

function normalizeRevision(value: unknown): string | null {
  return typeof value === "number" && Number.isFinite(value) ? String(Math.trunc(value)) : null;
}

function extractGmMemory(location: NormalizedLocation, rawLocations: unknown): string {
  if (!Array.isArray(rawLocations)) return "";
  const raw = rawLocations.find(
    (candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate) && normalizeId((candidate as { id?: unknown }).id) === location.id,
  ) as Record<string, unknown> | undefined;
  if (!raw) return "";
  return normalizeText(raw.gmMemory ?? raw.gmNotes ?? raw.memory ?? raw.privateNotes, 500);
}

export function buildLocationContextBlock(metadata: LocationContextMetadata): string | null {
  const locations = normalizeLocations(metadata.gameLocations);
  const current = resolveCurrentLocation(locations, metadata.currentGameLocationId);
  if (!current) return null;

  const byId = new Map(locations.map((location) => [location.id, location]));
  const breadcrumbs = resolveBreadcrumbs(current, byId);
  const destinations = resolveAvailableDestinations(current, locations, byId);
  const revision = normalizeRevision(metadata.gameLocationRevision);
  const gmMemory = extractGmMemory(current, metadata.gameLocations);

  const lines = [`<location_context${revision ? ` revision="${revision}"` : ""}>`];
  lines.push(`Current: ${current.name} (${current.id})`);
  if (breadcrumbs.length > 1) lines.push(`Path: ${breadcrumbs.map((location) => location.name).join(" > ")}`);
  if (current.description) lines.push(`Description: ${current.description}`);
  if (gmMemory) lines.push(`GM memory: ${gmMemory}`);
  if (destinations.length > 0) {
    lines.push("Available destinations:");
    for (const destination of destinations) {
      const relation = destination.id === current.parentId ? "parent" : destination.parentId === current.id ? "child" : "sibling";
      lines.push(`- ${destination.name} (${destination.id}; ${relation}${destination.state ? `; ${destination.state}` : ""})`);
    }
  }
  lines.push("Use only this current location and its listed destinations for immediate location context; do not import unrelated location descriptions.");
  lines.push("</location_context>");

  const block = lines.join("\n");
  return block.length <= MAX_LOCATION_CONTEXT_CHARS ? block : `${block.slice(0, MAX_LOCATION_CONTEXT_CHARS - 22).trim()}\n</location_context>`;
}
