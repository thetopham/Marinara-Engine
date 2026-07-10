import type { AgentPromptTemplateOption } from "../types/agent.js";

export const GAME_VIDEO_PROMPT_TEMPLATE_ID = "cinematic-scene-video";

export const GAME_VIDEO_PROMPT_TEMPLATE_VARIABLES = [
  "sceneTitle",
  "narrationSummary",
  "illustrationPrompt",
  "charactersLine",
  "settingLine",
  "artStyleLine",
  "durationSeconds",
  "aspectRatio",
  "sourceIllustrationLine",
  "experienceStyleLine",
  "motionPlanLine",
  "continuityLine",
  "transitionLine",
] as const;

export const GAME_VIDEO_PROMPT_TEMPLATE = [
  "Create a ${durationSeconds}-second ${aspectRatio} animated game scene from the provided first-frame illustration.",
  "${sourceIllustrationLine}",
  "Scene: ${sceneTitle}",
  "Story beat: ${narrationSummary}",
  "Characters: ${charactersLine}",
  "Setting: ${settingLine}",
  "Art style: ${artStyleLine}",
  "Reference prompt excerpt: ${illustrationPrompt}",
  "${experienceStyleLine}",
  "${motionPlanLine}",
  "${continuityLine}",
  "${transitionLine}",
  "Use the reference image as the visual anchor. Keep recognizable characters, setting, and mood while adding motion that feels natural for this moment.",
  "Follow the supplied motion, continuity, and timing plans when present. Otherwise choose restrained subject-led movement, atmospheric motion, and a stable ending pose that fit the scene.",
  "Do not add new subtitles, captions, UI, logos, watermarks, or unrelated characters. Preserve intentional panel borders and existing lettering when they are part of the reference. Avoid distorted anatomy, identity drift, text morphing, panel deformation, and abrupt unplanned cuts.",
].join("\n");

export const GAME_VIDEO_BUILT_IN_PROMPT_TEMPLATES: AgentPromptTemplateOption[] = [
  {
    id: GAME_VIDEO_PROMPT_TEMPLATE_ID,
    name: "Cinematic Scene Video",
    description:
      "Default Game Mode video prompt for animating a saved scene or storyboard keyframe from its first-frame image.",
    promptTemplate: GAME_VIDEO_PROMPT_TEMPLATE,
  },
];
