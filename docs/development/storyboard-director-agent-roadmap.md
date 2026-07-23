# Storyboard Director Agent Roadmap

Status: Proposed follow-up to the Game Storyboard MVP

Related documents:

- [Storyboard Prompt Director PRD](storyboard-prompt-director-prd.md)
- [Storyboard Prompt Director Implementation Plan](storyboard-prompt-director-implementation-plan.md)

## Decision

Build this in three ordered phases:

1. Improve the existing Game Mode Storyboard pipeline.
2. Expose the proven planner as a downloadable Storyboard Director agent.
3. Add Roleplay support using a configurable window of previous conversation exchanges.

Do not build an independent agent-only storyboard system. Game Mode already has the
storage, gallery, keyframe, video, retry, and automatic-generation foundations. The
agent should eventually plan work for that same Engine-owned pipeline.

## Why Game Mode comes first

Game Mode provides a natural source boundary: one completed Game Master turn. It also
already has Create Storyboard, automatic storyboard settings, storyboard records,
keyframes, gallery media, and scene-video generation.

The Game Storyboard PRD should first prove the difficult media workflow:

- Restore detailed animation planning fields.
- Generate a character and subject reference sheet.
- Generate consistent storyboard frames from that sheet.
- Produce a timed animation script with continuity, camera, action, and audio notes.
- Compile the approved plan into Seedance or an LTX 2.3 `LTXDirector` workflow.
- Preserve intermediate images and allow retries when video generation fails.

Only after that path works should it be generalized. This keeps Roleplay and the agent
from becoming separate implementations of an unproven pipeline.

## End-state workflow

```text
Completed Game turn or selected Roleplay scene
                    |
                    v
          Storyboard Director agent
                    |
                    v
       Validated storyboard production plan
          |              |               |
          v              v               v
   Reference sheet  Storyboard frames  Animation script
          \              |               /
           \             |              /
                    v
          Engine media orchestrator
                    |
                    v
       Seedance or LTX workflow compiler
                    |
                    v
          Existing media queue and gallery
```

The agent is the creative planner. Marinara Engine remains responsible for connection
selection, media generation, storage, provider payloads, ComfyUI workflow handling,
progress, cancellation, and retry behavior.

## Phase 1: improve Game Mode Storyboards

Implement the existing Storyboard Prompt Director PRD and implementation plan first.
This remains a Game Mode feature during Phase 1.

### Required result

For one completed Game Master turn, the existing Create Storyboard action can produce:

1. A validated storyboard plan.
2. One composite reference sheet for the important visible subjects, equipment, props,
   and scale relationships.
3. One or more storyboard images.
4. A chronological animation script divided into timed beats.
5. A video rendered through the selected Seedance or LTX connection.

The restored Storyboard Prompt Director preset should produce the full planning
contract. Other existing presets can continue producing their current compact
`narrationBeat` output.

### Phase 1 exit gate

Do not begin the agent port until the following have been demonstrated in Game Mode:

- The reference sheet and storyboard frames are saved in the gallery.
- The rich animation fields survive planning, review, storage, and retry.
- The same reviewed plan is used for the final render.
- An LTX workflow receives the intended prompts, timing, and first-frame image without
  changing its model, LoRA, sampler, scheduler, VAE, or performance configuration.
- Existing Storyboard presets still behave as before.
- A failed or cancelled video leaves the plan and generated images available for retry.

## Phase 2: port the planner into an agent

After Phase 1, package the Storyboard Prompt Director as a downloadable agent that can
request the same Engine-owned storyboard job.

The historical Storyboard Prompt Director prompt becomes the agent's default planning
prompt. It should no longer be treated as logic that only Game Mode settings can use.
The existing Game action and automatic settings can then invoke the agent-backed
planner through the shared service.

### Agent input

The Engine provides a bounded story and canon snapshot:

- The source Game turn or Roleplay conversation exchanges.
- Character cards, persona, and current visible-character information.
- Current outfits, equipment, injuries, expressions, and tracked state when available.
- Relevant world state, location, lore, and important props.
- Existing avatar and reference-image identities.
- Requested duration, aspect ratio, storyboard frame count, and visual style.

The source story determines what events may be animated. Cards, trackers, lore, and
summaries are continuity context; they must not cause unrelated historical events to
be added as new shots.

### Agent output

Add a structured `storyboard_plan` result rather than returning prose or ComfyUI JSON:

```ts
interface StoryboardPlan {
  title: string;
  summary: string;
  durationSeconds: number;
  aspectRatio: "16:9" | "9:16";
  referenceSheetPrompt: string;
  visualBible: {
    style: string;
    environment: string;
    subjects: Array<{
      name: string;
      appearance: string;
      outfit: string;
      equipment: string;
      fixedRules: string[];
    }>;
  };
  storyboardFrames: Array<{
    timeSeconds: number;
    title: string;
    purpose: string;
    imagePrompt: string;
    characters: string[];
    guideRole: "start" | "middle" | "end" | "reference_only";
  }>;
  animationBeats: Array<{
    startSecond: number;
    endSecond: number;
    action: string;
    camera: string;
    environmentMotion: string;
    audio: string;
    endState: string;
  }>;
  globalPrompt: string;
  negativePrompt: string;
  continuityRules: string[];
  warnings: string[];
}
```

The Engine validates and bounds this result before creating any paid media jobs.
Provider-specific request objects and node identifiers must never be part of the agent
contract.

### Engine agent integration

Marinara Engine needs:

- A new `storyboard_plan` agent result type.
- A new `trigger_storyboard_generation` capability.
- A result handler that validates the plan and queues the shared storyboard job.
- A reusable storyboard orchestration service extracted from the Game route.
- Idempotency based on chat, source message IDs, active swipe, and source hash.
- Existing prompt-debug controls applied to the final planner, image, and video prompts.

The agent should enqueue media work and return. It must not keep the main chat response
open while reference images, storyboard frames, or an LTX video render.

### Cross-repository ownership

The work is intentionally split:

- **Marinara-Agents** owns the downloadable agent definition, default prompt, manifest,
  settings, metadata, artwork, package artifact, and catalog entry.
- **Marinara Engine** owns the result type and capability, shared planner contract,
  chat context adapters, settings UI, storage, media queue, provider routing, and LTX
  compiler.

## Phase 3: add Roleplay support

Roleplay does not have Game Mode's completed-turn boundary. It therefore needs one
small source-selection layer before invoking the same Storyboard Director agent.

### Roleplay source unit

Define one **conversation exchange** as a user message followed by its visible assistant
response. Use only the active swipe. Do not split an exchange or include hidden,
discarded, tool-only, or alternate-swipe messages.

For a manual Create Storyboard action on an assistant response:

1. Treat that response as the end of the source range.
2. Include the configured number of complete previous exchanges.
3. Use fewer exchanges when the chat does not contain enough history.
4. If the planner context limit is reached, remove the oldest complete exchange first.
5. Save the exact source message IDs and source hash with the storyboard.

Suggested setting:

```ts
roleplayStoryboardLookbackExchanges: number; // 1-20, default 3
```

This setting means "animate this response and the previous N-1 complete exchanges."
It does not mean that the agent can reinterpret the entire chat history as current
action.

### Automatic Roleplay storyboards

Automatic generation should be off by default because it can start several image and
video jobs.

When enabled, use non-overlapping batches:

- Run after every configured number of completed assistant responses.
- Use the exchanges since the last successfully planned automatic storyboard.
- Never animate an exchange twice because of reload, retry, regeneration, or swipe.
- If a batch fails during media generation, keep its saved plan and retry that batch
  rather than advancing the automatic cursor.

Suggested setting:

```ts
roleplayStoryboardAutoEveryReplies: number | null; // null is disabled
```

Manual creation continues to use the lookback setting and does not move the automatic
cursor.

### Roleplay presentation

- Add Create Storyboard to the existing actions for an assistant response.
- Attach the resulting storyboard to the ending assistant message.
- Save its reference sheet, storyboard frames, and video in the normal chat gallery.
- Reuse the existing storyboard review, progress, cancellation, and retry surfaces.
- Do not add a separate Cinematic mode or Roleplay-only storyboard editor.

The existing storyboard parent storage is already keyed by chat and message, while its
Game snapshot, session, and turn fields are optional. Reuse it behind the shared
service for the MVP, even if its internal names remain Game-oriented. Add only the
reference-sheet link required by Phase 1 and an optional serialized list of source
message IDs for Roleplay. A table rename or new generic media-project schema is not
required for this rollout.

## Reference sheets and storyboard images

The agent plans the visual assets; the Engine generates them.

1. Generate one composite production reference sheet from the visual bible.
2. Save it as a normal gallery image.
3. Generate storyboard frames using that sheet and direct character avatars when the
   selected image provider supports references.
4. Save each frame independently so it can be reviewed or regenerated.
5. Let the user continue with the first frame only or select middle and ending frames
   as additional LTX guides.

The reference sheet should not normally be inserted as a temporal video frame because
the video model may try to animate the sheet layout. If the user's LTX workflow is
configured for Ingredients IC-LoRA reference images, the compiler may use the sheet on
that reference track. Otherwise, the sheet conditions the generated storyboard frames
only.

## LTX 2.3 compilation

Treat the uploaded ComfyUI API workflow as an Engine-owned template. Find exactly one
node whose `class_type` is `LTXDirector`; never depend on an exported node ID such as
`3678`.

Compile the validated plan into that node:

- `global_prompt`: persistent visual bible, environment, style, continuity rules, and
  overall audio atmosphere.
- `local_prompts`: one complete animation beat per segment, joined with `|`.
- `segment_lengths`: comma-separated pixel-space frame counts derived from each beat's
  time range and the workflow's resolved total length.
- `timeline_data`: uploaded start frame and any explicitly selected middle or ending
  guide frames, plus supported custom audio or motion segments.
- Timing: start/end seconds, duration seconds, and the corresponding resolved frame
  values.

For example, five equal three-second beats over a resolved 241-frame workflow can be
distributed deterministically as `48,48,48,48,49`. The compiler must use the actual
resolved workflow length rather than hardcoding this example.

Storyboard review frames do not all need to constrain the video. Default to using the
generated starting frame. Middle and ending frames are opt-in guides because too many
image constraints can reduce motion or create unwanted transitions.

Leave the workflow's frame rate, dimensions, resize behavior, audio switches, model,
text encoder, LoRAs, sampler, scheduler, VAE, guide strengths, compression, and
performance patches unchanged. The agent describes the production; it never rewrites
the graph.

## Settings ownership

Agent settings:

- Planner connection and prompt variant.
- Manual or automatic trigger behavior.
- Roleplay lookback or automatic batch size.
- Storyboard frame count.
- Clip duration and aspect ratio.
- Reference-sheet generation.
- Stop for review or continue automatically.
- First-frame-only or selected storyboard guide behavior.

Engine and chat settings:

- Image-generation connection and provider parameters.
- Video-generation connection and provider parameters.
- Uploaded ComfyUI workflow.
- ComfyUI credentials and endpoint.
- Gallery storage, queue, cancellation, and retry behavior.

Do not place provider credentials, model paths, workflow graphs, or sampling controls in
the downloadable agent package.

## Delivery order

Keep the changes reviewable and honor the repository boundary:

1. **Engine: Game Storyboard improvement** — implement and verify the existing PRD.
2. **Engine: shared orchestration and agent contract** — extract the reusable service,
   add `storyboard_plan`, and add `trigger_storyboard_generation`.
3. **Marinara-Agents: Storyboard Director package** — add the agent against that
   repository's `staging` branch.
4. **Engine: Roleplay adapter** — add source-window selection, message action,
   automatic batching, and shared storyboard presentation.

Each implementation effort should follow the owning repository's issue, branch, draft
PR, validation, and manual-proof workflow. Do not combine the Engine and Agents changes
in one cross-repository pull request.

## End-state acceptance criteria

- Game Mode first passes the existing Storyboard Prompt Director acceptance criteria.
- Installing the Storyboard Director agent does not install or duplicate a second
  media pipeline.
- The agent emits a validated provider-neutral production plan.
- Game Mode can invoke the agent from one completed Game Master turn.
- Roleplay can invoke it from the ending assistant response plus a configured number of
  previous complete exchanges.
- Automatic Roleplay batches do not overlap or animate the same source twice.
- The reference sheet, storyboard images, animation script, and video remain attached
  to one storyboard result.
- LTX receives persistent global context, timed local prompts, resolved segment lengths,
  and only the selected guide images.
- The uploaded ComfyUI workflow retains all user-controlled model and sampling settings.
- Failures preserve completed planning and image stages for targeted retry.

## Deferred work

- Conversation Mode support.
- Editing the full LTX timeline inside Marinara.
- Automatic multi-clip assembly into a longer film.
- Cross-chat reference-sheet libraries and staleness rules.
- Vision-based quality control of generated storyboard frames.
- Automatic retake selection from a completed video.
- AI-generated ComfyUI graphs or model and LoRA selection.
