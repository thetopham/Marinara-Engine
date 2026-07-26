// ──────────────────────────────────────────────
// Global Storyboard custom prompt presets
// ──────────────────────────────────────────────
import {
  normalizeAgentPromptTemplateOptions,
  type AgentPromptTemplateOption,
} from "../types/agent.js";

export const STORYBOARD_PROMPT_PRESET_SETTINGS_KEY = "storyboard-prompt-presets";

export interface StoryboardPromptPresetSettings {
  plannerTemplates: AgentPromptTemplateOption[];
  illustrationTemplates: AgentPromptTemplateOption[];
  videoTemplates: AgentPromptTemplateOption[];
  illustrationPlannerTemplateId: string | null;
  animationPlannerTemplateId: string | null;
  illustrationTemplateId: string | null;
  videoTemplateId: string | null;
}

export const DEFAULT_STORYBOARD_PROMPT_PRESET_SETTINGS: StoryboardPromptPresetSettings = {
  plannerTemplates: [],
  illustrationTemplates: [],
  videoTemplates: [],
  illustrationPlannerTemplateId: null,
  animationPlannerTemplateId: null,
  illustrationTemplateId: null,
  videoTemplateId: null,
};

function normalizeTemplateId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseSettingsValue(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function normalizeStoryboardPromptPresetSettings(raw: unknown): StoryboardPromptPresetSettings {
  const parsed = parseSettingsValue(raw);
  const value = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  const record = value as Record<string, unknown>;
  return {
    plannerTemplates: normalizeAgentPromptTemplateOptions(record.plannerTemplates).slice(0, 40),
    illustrationTemplates: normalizeAgentPromptTemplateOptions(record.illustrationTemplates).slice(0, 20),
    videoTemplates: normalizeAgentPromptTemplateOptions(record.videoTemplates).slice(0, 20),
    illustrationPlannerTemplateId: normalizeTemplateId(record.illustrationPlannerTemplateId),
    animationPlannerTemplateId: normalizeTemplateId(record.animationPlannerTemplateId),
    illustrationTemplateId: normalizeTemplateId(record.illustrationTemplateId),
    videoTemplateId: normalizeTemplateId(record.videoTemplateId),
  };
}
