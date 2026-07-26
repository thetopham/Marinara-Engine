// ──────────────────────────────────────────────
// Global Storyboard custom prompt presets
// ──────────────────────────────────────────────
import {
  STORYBOARD_PROMPT_PRESET_SETTINGS_KEY,
  normalizeAgentPromptTemplateOptions,
  normalizeStoryboardPromptPresetSettings,
  type AgentPromptTemplateOption,
} from "@marinara-engine/shared";
import { logger } from "../../lib/logger.js";
import type { createAppSettingsStorage } from "../storage/app-settings.storage.js";

type AppSettingsStorage = ReturnType<typeof createAppSettingsStorage>;

function mergeTemplates(globalValue: unknown, legacyValue: unknown): AgentPromptTemplateOption[] {
  const globalTemplates = normalizeAgentPromptTemplateOptions(globalValue);
  const globalIds = new Set(globalTemplates.map((template) => template.id));
  return [
    ...globalTemplates,
    ...normalizeAgentPromptTemplateOptions(legacyValue).filter((template) => !globalIds.has(template.id)),
  ];
}

export async function applyGlobalStoryboardPromptPresetSettings(
  meta: Record<string, unknown>,
  appSettings: AppSettingsStorage,
): Promise<Record<string, unknown>> {
  try {
    const settings = normalizeStoryboardPromptPresetSettings(
      await appSettings.get(STORYBOARD_PROMPT_PRESET_SETTINGS_KEY),
    );
    return {
      ...meta,
      gameStoryboardIllustrationPromptTemplateId:
        settings.illustrationPlannerTemplateId ?? meta.gameStoryboardIllustrationPromptTemplateId,
      gameStoryboardAnimationPromptTemplateId:
        settings.animationPlannerTemplateId ?? meta.gameStoryboardAnimationPromptTemplateId,
      gameStoryboardImagePromptTemplateId:
        settings.illustrationTemplateId ?? meta.gameStoryboardImagePromptTemplateId,
      gameStoryboardVideoPromptTemplateId: settings.videoTemplateId ?? meta.gameStoryboardVideoPromptTemplateId,
      gameStoryboardPromptTemplates: mergeTemplates(
        settings.plannerTemplates,
        meta.gameStoryboardPromptTemplates,
      ),
      gameStoryboardImagePromptTemplates: mergeTemplates(
        settings.illustrationTemplates,
        meta.gameStoryboardImagePromptTemplates,
      ),
      gameStoryboardVideoPromptTemplates: mergeTemplates(settings.videoTemplates, meta.gameVideoPromptTemplates),
    };
  } catch (error) {
    logger.warn(error, "[storyboard-presets] Failed to load global prompt presets");
    return meta;
  }
}
