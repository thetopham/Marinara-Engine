// ──────────────────────────────────────────────
// Personal Extension Types
// ──────────────────────────────────────────────

export type PersonalExtensionRuntime = "client" | "server";

export type PersonalExtensionSource = "local" | "professor_mari" | "legacy" | "profile_import";

export interface PersonalExtensionRevision {
  contentHash: string;
  version: string | null;
  runtime: PersonalExtensionRuntime;
  css: string | null;
  js: string | null;
  serverJs: string | null;
  savedAt: string;
}

/**
 * User-owned code stored by Marinara.
 *
 * Browser code runs with the same origin and data access as Marinara's own UI.
 * Server code runs as trusted application code in the Marinara Node.js process.
 * Neither runtime is a security sandbox. Execution is allowed only when the
 * stored executable bytes still match the exact approved SHA-256 hash.
 */
export interface PersonalExtension {
  id: string;
  name: string;
  version: string | null;
  description: string;
  runtime: PersonalExtensionRuntime;
  css: string | null;
  js: string | null;
  serverJs: string | null;
  enabled: boolean;
  contentHash: string;
  approvedHash: string | null;
  source: PersonalExtensionSource;
  revisions: PersonalExtensionRevision[];
  serverStatus?: "running" | "stopped" | "error";
  serverError?: string | null;
  installedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalClientExtensionRuntime {
  id: string;
  name: string;
  description: string;
  contentHash: string;
  css: string | null;
  hasJavaScript: boolean;
}
