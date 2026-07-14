import type { BuiltInAgentManifest } from "./agent-manifest.types.js";
import { BUILT_IN_AGENT_MANIFESTS as GENERATED_AGENT_MANIFESTS } from "./agent-registry.generated.js";

/** Compatibility source used only by the one-time upgrade migration. */
export const BUNDLED_AGENT_MANIFESTS: readonly BuiltInAgentManifest[] = GENERATED_AGENT_MANIFESTS;

/** Active runtime registry. Fresh installs populate it only from downloaded packages. */
export const BUILT_IN_AGENT_MANIFESTS: BuiltInAgentManifest[] = [];

export function replaceBuiltInAgentManifestRegistry(manifests: readonly BuiltInAgentManifest[]): void {
  BUILT_IN_AGENT_MANIFESTS.splice(0, BUILT_IN_AGENT_MANIFESTS.length, ...manifests);
}

export function getBuiltInAgentManifest(agentId: string): BuiltInAgentManifest | null {
  return BUILT_IN_AGENT_MANIFESTS.find((agent) => agent.id === agentId) ?? null;
}

export function getBuiltInAgentDefaultPrompt(agentId: string): string {
  return getBuiltInAgentManifest(agentId)?.defaultPromptTemplate ?? "";
}

export function isBuiltInAgentHiddenFromLibrary(agentId: string): boolean {
  return getBuiltInAgentManifest(agentId)?.libraryHidden === true;
}

export function isBuiltInAgentRuntimeDisabled(agentId: string): boolean {
  return getBuiltInAgentManifest(agentId)?.runtimeDisabled === true;
}
