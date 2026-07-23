# Storyboard Prompt Director PRD

Status: Proposed MVP

Audience: Marinara Engine maintainers and contributors

Broader rollout: [Storyboard Director Agent Roadmap](storyboard-director-agent-roadmap.md).
This PRD is Phase 1 and should be implemented and verified in Game Mode before the
planner is packaged as an agent or exposed to Roleplay.

## Summary

Restore a detailed **Storyboard Prompt Director** as an Animation Planner preset, then let the existing Storyboard pipeline use its character reference sheet and animation script when rendering with Seedance 2.0 or an LTX 2.3 ComfyUI workflow.

This is an upgrade to Storyboards, not a new Cinematic mode. The existing **Create storyboard** action, automatic storyboard settings, keyframe records, gallery, viewer, media queue, and video connection remain the workflow.

For a single fifteen-second sequence like the supplied Seedance example, the user selects **Storyboard Prompt Director**, sets **Keyframes per Turn** to `1`, and sets **Animation Clip Duration** to `15` seconds. More keyframes continue to create separate clips as they do today.

## Existing foundation

This feature previously existed in a simpler form:

- PR #3192 was developed on `codex/game-storyboard-prompt-director`.
- Commit `8dfee2461` added `GAME_STORYBOARD_DIRECTOR` with `videoPrompt`, `continuityNotes`, `cameraMotion`, `transitionHint`, duration, and aspect ratio per keyframe.
- Commit `6a7d7da82` split illustration-only and animation prompt paths.
- Commit `d0e5eecae` removed the rich director prompt and began clearing the animation-specific fields during sanitization.
- Current Animation Planner presets later restored useful motion planning inside `narrationBeat`, including **Anime Episode Director**, but the richer fields still remain unused in the current schema and route.

The MVP should reactivate that existing contract instead of creating a second director system.

## Problem

Current Storyboards can produce animation-ready first frames and short motion directions. They do not produce the complete reference-driven package used by stronger video workflows:

1. A visual reference sheet grounded in the game's canonical character descriptions and avatars.
2. A storyboard first frame.
3. A detailed chronological video prompt with explicit continuity, camera, and ending state.
4. A provider-specific handoff that uses Seedance reference mode or fills an existing `LTXDirector` node.

Users can write all of this manually, but then Marinara is no longer automating the production chain.

## Goals

- Restore the historical detailed animation fields as a selectable Animation Planner preset.
- Generate one composite visual reference sheet before the storyboard keyframes.
- Use the reference sheet to improve keyframe consistency.
- Send one deterministic animation plan to the selected video provider.
- Support Seedance reference-to-video and LTX 2.3 `LTXDirector` workflows.
- Preserve current Storyboard defaults and behavior for every other preset.

## Non-goals

- A new top-level mode, route, viewer, or timeline editor.
- A general character-asset library or automatic cross-turn sheet cache.
- One continuous video assembled from several existing storyboard keyframes.
- AI-generated ComfyUI graphs, node IDs, model paths, samplers, or LoRA settings.
- Guaranteed shot-for-shot compliance from a generative video model.

## User flow

1. In **Chat Settings > Agents > Storyboards**, select **Storyboard Prompt Director** under **Animation Planner**.
2. Choose the existing keyframe count and clip duration. Use one keyframe for one continuous clip.
3. Run **Create storyboard**, or enable the existing **Automatic Storyboard Animations** setting.
4. Marinara plans the reference sheet, first-frame image, and animation direction in one planner call.
5. Marinara generates the reference sheet, then the keyframe image.
6. Marinara renders the clip with the selected video connection.
7. The reference sheet, keyframe, prompt details, and video remain attached to the existing storyboard result.

No new button or automatic-generation toggle is required.

## Planner output

The restored preset uses the existing storyboard shape plus one root field:

```ts
interface PlannedStoryboard {
  title: string;
  summary: string;
  referenceSheetPrompt?: string;
  warnings?: string[];
  keyframes: Array<{
    title: string;
    sectionStartIndex: number;
    sectionEndIndex: number;
    anchorQuote: string;
    anchorKind: "narration" | "dialogue" | "readable" | "system";
    narrationBeat: string;
    imagePrompt: string;
    videoPrompt: string;
    characters: string[];
    continuityNotes: string;
    cameraMotion: string;
    transitionHint: string;
    durationSeconds: number;
    aspectRatio: "16:9" | "9:16";
  }>;
}
```

`videoPrompt` is chronological and duration-aware. It should use timed ranges when the clip contains several connected actions, then end on an explicit continuing action or hold. `continuityNotes` carries fixed identity, equipment, anatomy, creature, and effect-origin rules. Direct contradictions should be resolved in favor of canonical appearance and added to `warnings` for prompt review.

Existing Animation Planner presets may omit these fields. Their current `narrationBeat` behavior must remain unchanged.

## Reference sheet

- Generate one clean `16:9` composite sheet for the visible cast, important creature, props, and scale relationship.
- Build it from canonical Game Mode appearance context and existing avatar references.
- Save it as a normal chat-gallery image and link it from the storyboard parent.
- Reserve one reference slot for it when generating each scene keyframe, then attach direct avatar references within the remaining provider limit.
- Do not run it through the ordinary scene-image prompt rewrite that bans contact sheets and multi-panel layouts.
- Generate a new sheet per storyboard in the MVP. Reuse and staleness rules are deferred.

GPT Image 2 is a strong choice for this step, but the feature uses the selected image connection and does not hardcode a model.

## Video provider behavior

### Seedance 2.0

- For this preset, use reference-to-video with the reference sheet followed by the generated first-frame image.
- Send the compiled `videoPrompt` and continuity fields as one chronological prompt.
- Request generated audio when supported.
- Preserve ordinary Seedance image-to-video behavior for all other callers.
- If reference mode is rejected, keep the generated images and show a retryable error; do not silently submit a second paid job.

### LTX 2.3 through ComfyUI

- Keep the uploaded API-format workflow as the graph and runtime configuration.
- Find exactly one node with `class_type: "LTXDirector"`.
- Read its configured frame rate and dimensions, then fill only its scene content and derived timing inputs: seconds, frames, global prompt, local prompts, segment lengths, and timeline data.
- Use the generated scene keyframe as the timeline image reference. The reference sheet has already conditioned that keyframe.
- Leave frame rate, dimensions, model, clip, audio VAE, LoRAs, samplers, schedulers, VAE settings, guide strengths, compression, and performance patches unchanged.
- If the workflow has zero or multiple `LTXDirector` nodes, use the current `%prompt%` and `%reference_image_name%` path and show a warning.

The language model never receives graph-writing authority. Marinara converts its validated plan into the allowlisted `LTXDirector` fields.

## Storage

Reuse the existing animation columns on `game_turn_storyboard_keyframes`.

Add only `referenceSheetImageId` to `game_turn_storyboards`, referencing the existing chat-gallery image. The sheet's prompt, provider, model, dimensions, and creation time already live on the gallery row.

No new plan table, cinematic record type, or parent video field is needed.

## Acceptance criteria

- **Storyboard Prompt Director** appears as an Animation Planner preset without changing the current default.
- The preset produces and preserves non-empty `videoPrompt`, `continuityNotes`, `cameraMotion`, and `transitionHint` fields.
- Manual preview and render use the same sanitized planner result.
- A storyboard generated with the preset saves one reference sheet before its keyframes.
- Keyframe generation uses the sheet as a reference when supported.
- Seedance receives reference mode, the sheet, the first frame, the detailed prompt, and the audio choice.
- An LTX workflow with exactly one `LTXDirector` node receives only the allowlisted content/timing changes.
- One keyframe at fifteen seconds produces one continuous clip; multiple keyframes retain the current separate-clip behavior.
- Existing Storyboard presets and ordinary scene-video requests remain unchanged.
- Failed video generation preserves the reference sheet and keyframe for retry.
