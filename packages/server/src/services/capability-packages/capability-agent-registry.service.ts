import {
  BUNDLED_AGENT_MANIFESTS,
  replaceBuiltInAgentDefinitions,
  type BuiltInAgentManifest,
} from "@marinara-engine/shared";
import { capabilityPackageManager } from "./package-manager.service.js";

let compatibilityFallbackEnabled = false;

export async function initializeCapabilityAgentRegistry(options: { legacyFallback: boolean }): Promise<void> {
  compatibilityFallbackEnabled = options.legacyFallback;
  await refreshCapabilityAgentRegistry();
}

export async function refreshCapabilityAgentRegistry(): Promise<readonly BuiltInAgentManifest[]> {
  const definitions = await capabilityPackageManager.agentDefinitions();
  const active: BuiltInAgentManifest[] = [...definitions];
  if (compatibilityFallbackEnabled) {
    const installedIds = new Set(definitions.map((definition) => definition.id));
    active.push(...BUNDLED_AGENT_MANIFESTS.filter((definition) => !installedIds.has(definition.id)));
  }
  replaceBuiltInAgentDefinitions(active);
  return active;
}
