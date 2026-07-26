// ──────────────────────────────────────────────
// Hooks: global Storyboard custom prompt presets
// ──────────────────────────────────────────────
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  STORYBOARD_PROMPT_PRESET_SETTINGS_KEY,
  normalizeStoryboardPromptPresetSettings,
  type AppSettingsResponse,
  type StoryboardPromptPresetSettings,
} from "@marinara-engine/shared";
import { api } from "../lib/api-client";

export const storyboardPromptPresetKeys = {
  settings: ["app-settings", STORYBOARD_PROMPT_PRESET_SETTINGS_KEY] as const,
};

export function useStoryboardPromptPresetSettings() {
  return useQuery({
    queryKey: storyboardPromptPresetKeys.settings,
    queryFn: async () => {
      const result = await api.get<AppSettingsResponse>(
        `/app-settings/${STORYBOARD_PROMPT_PRESET_SETTINGS_KEY}`,
      );
      return normalizeStoryboardPromptPresetSettings(result.value);
    },
    staleTime: 5 * 60_000,
  });
}

export function useUpdateStoryboardPromptPresetSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: StoryboardPromptPresetSettings) => {
      const normalized = normalizeStoryboardPromptPresetSettings(settings);
      await api.put(`/app-settings/${STORYBOARD_PROMPT_PRESET_SETTINGS_KEY}`, {
        value: JSON.stringify(normalized),
      });
      return normalized;
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(storyboardPromptPresetKeys.settings, settings);
    },
  });
}
