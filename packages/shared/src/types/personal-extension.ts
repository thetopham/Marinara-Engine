// ──────────────────────────────────────────────
// Personal Extension Types
// ──────────────────────────────────────────────

export type PersonalExtensionRuntime = "client" | "server";

export type PersonalExtensionSource = "external" | "local" | "professor_mari" | "legacy" | "profile_import";

export type PersonalExtensionSandboxBackend = "browser-opaque-origin" | "macos-seatbelt" | "linux-bubblewrap";

export interface PersonalExtensionPolicy {
  externalExtensionsEnvEnabled: boolean;
  externalExtensionsEnabled: boolean;
  serverSandboxAvailable: boolean;
  serverSandboxBackend: Exclude<PersonalExtensionSandboxBackend, "browser-opaque-origin"> | null;
  serverSandboxReason: string | null;
}

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
 * Browser code runs in an opaque-origin sandboxed iframe with a message-only
 * capability API. Server code runs in a separate OS-sandboxed process with
 * Node permissions enabled. Unsupported server platforms fail closed.
 * Execution is allowed only while the stored executable bytes still match the
 * exact approved SHA-256 hash.
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
  sandboxUrl: string;
}
