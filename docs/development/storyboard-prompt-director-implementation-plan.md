# Storyboard Prompt Director Implementation Plan

Status: Proposed

Related PRD: [Storyboard Prompt Director PRD](storyboard-prompt-director-prd.md)

Broader rollout: [Storyboard Director Agent Roadmap](storyboard-director-agent-roadmap.md).
This plan covers the Game Mode proving phase only; the agent and Roleplay work follow
after its exit gate passes.

## Delivery shape

Implement this as one focused feature PR against `staging`. Before coding, open or confirm the feature issue, identify the owner on it, and open a draft PR when implementation starts.

Do not introduce a new Cinematic mode. Extend the existing Storyboard planner and render path.

## 1. Restore the detailed planner preset

Update:

- `packages/shared/src/constants/game-storyboard-prompts.ts`
- `packages/server/src/routes/game.routes.ts`
- `scripts/regressions/prompt.regression.ts`

Add **Storyboard Prompt Director** to `GAME_STORYBOARD_ANIMATION_PROMPT_TEMPLATES`. Base its JSON contract on the historical `GAME_STORYBOARD_DIRECTOR` from `8dfee2461`, with these changes:

- Keep current turn-section anchors and visible-character restrictions.
- Add the root `referenceSheetPrompt` and a bounded `warnings` list.
- Make `videoPrompt` chronological and duration-aware.
- Keep `narrationBeat` as the short human-readable beat.
- Put fixed visual rules in `continuityNotes`.
- Keep `cameraMotion` and `transitionHint` explicit.

Restore animation-field sanitization when `generateVideos` is true:

- Accept, bound, and save `videoPrompt`, `continuityNotes`, `cameraMotion`, and `transitionHint` when returned.
- Keep blank values for illustration-only plans.
- Let existing animation presets continue using `narrationBeat` when they omit the restored fields.
- Make the fallback video direction from `narrationBeat` without inventing extra events.

Update `buildStoryboardGalleryAnimatePrompt` to prefer this order:

1. `videoPrompt`
2. `narrationBeat`
3. the existing narration fallback

Append non-empty continuity, camera, and transition fields to the animation direction before the existing provider prompt limiter runs.

## 2. Generate the reference sheet in the existing route

Update:

- `packages/server/src/db/schema/game-storyboards.ts`
- `packages/server/src/db/file-backed-store.ts`
- `packages/server/src/services/storage/game-storyboards.storage.ts`
- `packages/shared/src/types/game.ts`
- `packages/server/src/routes/game.routes.ts`

Add one nullable `referenceSheetImageId` foreign key to the storyboard parent and expose its normal gallery media reference when serializing a storyboard.

For a plan with `referenceSheetPrompt`:

1. Use the already resolved image connection and canonical appearance assets.
2. Generate the sheet before keyframes.
3. Bypass the ordinary scene-image rewrite/template that rejects contact-sheet layouts.
4. Save the result through existing chat-gallery storage.
5. Store its ID on the storyboard.
6. Reserve one keyframe-reference slot for the sheet, then attach direct character avatars within the remaining provider limit.

If sheet generation fails, continue with the current avatar-reference path and mark the storyboard partial with a clear error. Do not fail every keyframe automatically.

In preview mode, include the reference-sheet prompt before the keyframe prompts. Reuse the current prompt-review flow rather than adding a new modal.

## 3. Extend the video request narrowly

Update:

- `packages/server/src/services/video/video-generation.ts`

Add optional fields while preserving existing callers:

```ts
referenceImages?: VideoReferenceImage[];
referenceMode?: "first-frame" | "reference";
generateAudio?: boolean;
ltxDirector?: {
  globalPrompt: string;
  localPrompts: string;
  segmentLengths: string;
  durationSeconds: number;
};
```

The route builds these values from the sanitized storyboard frame. The planner does not build provider payloads.

### Seedance

- Use existing `referenceImage` and `lastFrameImage` for ordinary image-to-video requests.
- For `referenceMode: "reference"`, upload the sheet and first frame in order and send `generation_type: "reference-to-video"`.
- Set `generate_audio` from the optional request field instead of always sending `false`.
- Validate provider material limits before submission.
- Return a capability error instead of silently truncating references or starting a fallback job.

### LTX 2.3

When `ltxDirector` is present:

1. Parse the saved ComfyUI API workflow.
2. Locate nodes by `class_type === "LTXDirector"`, never by an ID such as `3678`.
3. Continue only when exactly one node exists.
4. Upload the first-frame image through the current ComfyUI upload path.
5. Read `frame_rate`, `custom_width`, and `custom_height` from the configured node after normal placeholder resolution.
6. Build `timeline_data` with one image segment at frame zero and the resolved clip duration.
7. Patch only:
   - `start_second`, `end_second`, `duration_seconds`
   - `start_frame`, `end_frame`, `duration_frames`
   - `global_prompt`, `local_prompts`, `segment_lengths`
   - `timeline_data`
8. Validate the nested JSON and frame ranges.
9. Run the existing queue, prompt submission, history polling, download, and cancellation flow.

Leave every connection input and sampling/performance value in the user's workflow untouched. With zero or multiple `LTXDirector` nodes, log and return a visible warning while using the existing placeholder path.

## 4. Keep the UI change small

Update likely touchpoints:

- `packages/client/src/components/chat/ChatSettingsDrawer.tsx`
- `packages/client/src/components/game/GameSurface.tsx`
- `packages/client/src/hooks/use-game-storyboards.ts`

Required UI work:

- Show the new preset in the existing **Animation Planner** selector.
- Include the reference-sheet prompt in manual prompt review.
- Show the restored animation direction with the keyframe's existing storyboard details.
- Explain in the preset description that `1` keyframe creates one continuous clip and higher counts create separate clips.

Do not add a new action button, settings card, editor, timeline, Zustand store, or navigation state.

## Validation

Add cases to the existing regression scripts; do not add `.test.ts` files.

Automated coverage:

- The new preset requests the historical detailed fields plus `referenceSheetPrompt`.
- Sanitization preserves rich fields for animation and clears them for illustration-only planning.
- Existing animation presets still fall back to `narrationBeat`.
- Preview and render accept the same reviewed plan.
- The reference sheet is saved and linked without a new media table.
- Ordinary Seedance image-to-video payloads do not change.
- Seedance reference mode orders sheet then first frame and respects `generateAudio`.
- LTX patching changes only the allowlisted inputs on exactly one `LTXDirector` node.
- Quotes and newlines cannot break `timeline_data` JSON.
- Zero-node and multiple-node LTX workflows retain the existing placeholder path.

Run for implementation work:

```bash
pnpm check
pnpm regression:prompt
pnpm smoke:ui
```

Manual verification:

- Select **Storyboard Prompt Director**, one keyframe, and a fifteen-second duration.
- Generate from a completed GM turn containing two subjects and one strict continuity rule.
- Confirm the sheet appears first, the keyframe follows it, and both remain in the gallery.
- Confirm the final Seedance request uses reference mode and generated audio.
- Confirm an LTX workflow changes the `LTXDirector` content/timing fields but not its model, LoRA, sampler, scheduler, VAE, or performance settings.
- Repeat with an existing Animation Planner preset and confirm its current output is unchanged.
- Cancel a render and confirm Marinara does not later present it as completed.

## Definition of done

- One existing Storyboard action performs planning, reference-sheet generation, keyframe generation, and video rendering.
- The historical detailed prompt fields are functional again rather than replaced with a second plan format.
- Seedance 2.0 and one LTX 2.3 `LTXDirector` workflow pass manual verification.
- Existing Storyboard and ordinary video behavior pass regressions.
- Debug prompt logging uses the existing debug controls.
- User-facing Storyboard and scene-video guides are updated with the final behavior.
- PR validation checkboxes remain unchecked for human verification.
