// ──────────────────────────────────────────────
// Game Location Types
// ──────────────────────────────────────────────

/** Runtime visibility/progress status for a game location. */
export type GameLocationStatus = "unknown" | "discovered" | "visited" | "current" | "locked";

/** A directed connection from one game location to another. */
export interface GameLocationLink {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  /** Optional label for the route, exit, or travel action shown to players. */
  label?: string;
  /** Optional short description of the route or transition affordance. */
  description?: string;
  /** Whether the link can currently be traversed. Missing means traversable. */
  enabled?: boolean;
  /** Optional user-facing reason shown when enabled is false. */
  disabledReason?: string | null;
  /** Optional ordering hint for displaying exits from the same location. */
  sortOrder?: number;
}

/** A normalized location in a Game Mode world, area, or scene graph. */
export interface GameLocation {
  id: string;
  /** Parent location ID for nested areas/rooms. Null or omitted means top-level. */
  parentId?: string | null;
  name: string;
  /** Optional short label or emoji used by compact displays. */
  icon?: string;
  description?: string;
  state?: GameLocationStatus;
  /** Stable map ID this location belongs to, when mirrored from or shown on a GameMap. */
  mapId?: string | null;
  /** Optional presentation coordinates for map/graph displays. */
  position?: { x: number; y: number } | null;
  /** Optional ordering hint among siblings with the same parentId. */
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Normalized location state for a Game Mode session/campaign. */
export interface GameLocationState {
  locations: GameLocation[];
  links: GameLocationLink[];
  currentGameLocationId: string | null;
  startingGameLocationId?: string | null;
  revision: number;
  transitions?: GameLocationTransition[];
}

/** Audit record for a location change within a game session. */
export interface GameLocationTransition {
  id: string;
  fromLocationId: string | null;
  toLocationId: string;
  /** Link used for this transition, if a specific connection was traversed. */
  linkId?: string | null;
  /** Why the transition happened. */
  source: "manual" | "gm" | "system";
  /** Optional character, party member, or user-facing actor that initiated the move. */
  actorId?: string | null;
  /** Optional summary or command text explaining the move. */
  note?: string | null;
  createdAt: string;
}

/** Request body for manually moving the game to a different location. */
export interface ManualGameLocationTransitionRequest {
  toLocationId: string;
  fromLocationId?: string | null;
  linkId?: string | null;
  note?: string | null;
}

/** Response body returned after a manual location transition is applied. */
export interface ManualGameLocationTransitionResponse {
  currentGameLocationId: string;
  gameLocationRevision: number;
  transition: GameLocationTransition;
  locations?: GameLocation[];
}
