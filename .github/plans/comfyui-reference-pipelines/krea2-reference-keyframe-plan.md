# Krea 2 Reference-to-Keyframe Implementation Plan

## Objective

Produce still storyboard keyframes from Marinara's existing spatial-location and
visible-character references using a local Krea 2 edit workflow. This is the
non-animation path and remains the first stage of the default storyboard-first
animation path.

## Verified starting point

The local source workflow inspected during planning is:

```text
C:\Users\theto\Downloads\krea2_character_consistency_workflow.json
SHA-256: 8F34FA58A432C8F8F27B4BFF045379A38457A9C76D7D14168D0C47CEFDC9AA82
```

Recheck the hash before implementation. The source file is a ComfyUI editor
workflow, not an API export.

Observed graph facts:

- 14 nodes and 16 links.
- `CLIPLoader` selects `qwen3vl_4b_fp8_scaled.safetensors` with type `krea2`.
- `UNETLoader` selects `krea2_turbo_bf16.safetensors`.
- `VAELoader` selects `Wan2_1_VAE_bf16.safetensors`.
- `TextEncodeQwenImageEditPlus` accepts optional `image1`, `image2`, and
  `image3`; only `image1` is connected in the downloaded graph.
- The same `image1` also runs through `VAEEncode -> ReferenceLatent`, so the
  workflow is not a caption-only vision pass.
- The sampler starts from an empty SD3 latent and outputs through `SaveImage`.
- No Marinara placeholders are present.

The exact model filenames expected by this downloaded graph were not found in
the two active model roots during planning. The local installation has other
Krea/Qwen candidates, including the RedCraft Krea model, a Qwen3-VL Heretic INT8
encoder, and the Qwen image VAE. Compatibility is a test requirement, not an
assumption.

## Existing Engine support

The local ComfyUI image adapter already:

- accepts up to four references;
- deduplicates them while preserving order;
- uploads local references by content hash;
- replaces `%reference_image_name%` and numbered
  `%reference_image_name_01%` through `%reference_image_name_04%`;
- replaces prompt, negative prompt, dimensions, seed, sampler, scheduler, CFG,
  denoise, and model placeholders;
- optionally backfills declared but missing numbered slots with a 1x1 image.

Game Mode already constructs the reference order as location first, followed by
the visible characters selected for that keyframe. The first implementation
should therefore require little or no Engine routing code if the workflow can
safely consume variable reference counts.

## Target workflow contract

The production API workflow must expose:

| Purpose                    | Placeholder                 |
| -------------------------- | --------------------------- |
| Positive prompt            | `%prompt%`                  |
| Negative prompt            | `%negative_prompt%`         |
| Width and height           | `%width%`, `%height%`       |
| Seed                       | `%seed%`                    |
| Location/primary reference | `%reference_image_name_01%` |
| Character/reference slot 2 | `%reference_image_name_02%` |
| Character/reference slot 3 | `%reference_image_name_03%` |

Keep the loader filenames hard-coded until the RTX-3080 model combination is
proven. Do not use `%model%` to make an unvalidated checkpoint interchangeable.

The workflow must save through a connected `SaveImage` node and complete when
submitted through `/prompt` as API JSON.

## Reference-role experiments

`ReferenceLatent` strengthens only the image routed through `VAEEncode`, while
Qwen can inspect all three images. Run both arrangements before selecting the
production graph:

### Layout-anchored candidate

```text
image1 + ReferenceLatent = spatial-location reference
image2                   = primary character
image3                   = secondary character
```

Expected advantage: location geometry and composition remain recognizable.
Risk: character identity may be weaker because character images are visual-text
conditions but not the reference latent.

### Identity-anchored candidate

```text
image1 + ReferenceLatent = primary character
image2                   = spatial-location reference
image3                   = secondary character
```

Expected advantage: face, clothing, and silhouette stay closer to the primary
character. Risk: the generated scene may borrow location style without retaining
the intended spatial layout.

Do not decide this from a single attractive image. Use the controlled matrix
below.

## Variable reference counts

The Qwen edit node exposes three image inputs, while Marinara can currently send
four references. The initial workflow therefore directly covers:

- location only;
- location + one character;
- location + two characters.

Before production, verify how the graph behaves when unused declared slots are
backfilled with Marinara's 1x1 placeholder. If the placeholder affects output,
do not ship a graph that treats it as a real reference. Choose one of these in
order:

1. update to a currently maintained Krea edit node with at least four optional
   image inputs, if one is verified compatible;
2. add explicit reference-count/presence placeholders and workflow switches;
3. build a character-sheet reference for three-character shots and prove that
   it does not produce collage panels or identity mixing;
4. limit this Krea connection to location + two visible characters and route
   larger shots to the existing provider path.

The limitation must be explicit in connection help or routing. Silent dropping
of a visible character is not acceptable.

## Phase 0: reproduce the source workflow

1. Preserve the downloaded source unchanged and record its hash.
2. Confirm the current live schemas for `TextEncodeQwenImageEditPlus` and
   `ReferenceLatent`.
3. Inventory exact loader filenames through live `object_info`, not the editor
   widgets alone.
4. Queue the original one-reference workflow with its expected model stack or
   document the exact missing-model failure.
5. Record peak VRAM, wall time, resolution, sampler, steps, and output hash.

Exit criterion: one reproducible one-reference render or a documented model
compatibility blocker.

## Phase 1: adapt to the RTX-3080 model stack

1. Create a copy of the editor workflow for the candidate INT8 Krea/Qwen stack.
2. Change only loaders first; keep prompt, seed, dimensions, sampler, and source
   image frozen.
3. Confirm the visual encoder actually receives image tensors and the reference
   latent reaches positive conditioning.
4. Compare expected BF16/FP8 and installed INT8 candidates where capacity allows.
5. Select the smallest combination that preserves identity and completes
   reliably on 10 GB VRAM.

Do not call the INT8 graph equivalent merely because it queues. Inspect the
result and record quality/runtime differences.

## Phase 2: add location and character slots

1. Connect image2 and image3 to the positive Qwen edit encoder.
2. Build layout-anchored and identity-anchored candidates.
3. Use concise prompts that identify each reference's role and describe one
   target composition.
4. Verify that negative conditioning does not receive reference images unless
   the node's current documentation explicitly requires it.
5. Test missing-slot behavior with the real Marinara placeholder image.

## Phase 3: export for Marinara

1. Add the exact local filename placeholders to `LoadImage` nodes.
2. Add the prompt, negative prompt, dimension, and seed placeholders.
3. Queue the editor graph after each change.
4. Export in API format.
5. Parse the export and trace every placeholder to the intended input.
6. Store the API JSON on a dedicated Krea image connection and click **Test
   Image**.
7. Generate one real Game Mode storyboard keyframe so the proof includes the
   actual reference ordering and compiled prompt.

## Controlled proof matrix

Freeze source images, prompt, negative prompt, seed set, dimensions, steps, and
sampler. Render at least three seeds per row.

| Row | References                  | Candidate                       | Expected proof                             |
| --- | --------------------------- | ------------------------------- | ------------------------------------------ |
| K1  | one character               | identity anchored               | face, hair, outfit retained                |
| K2  | location + one character    | layout anchored                 | location topology + identity               |
| K3  | location + one character    | identity anchored               | compare identity/layout tradeoff           |
| K4  | location + two characters   | winning candidate               | both identities remain distinct            |
| K5  | location + missing slots    | production placeholder behavior | no blank-image influence or load failure   |
| K6  | portrait aspect             | winning candidate               | no reference cropping regression           |
| K7  | landscape aspect            | winning candidate               | no reference cropping regression           |
| K8  | location + three characters | chosen overflow strategy        | no silent reference loss or collage output |

Score each output for:

- primary and secondary face identity;
- clothing/accessory retention;
- location geometry and landmark retention;
- correct left/right and foreground/background placement;
- duplicate or merged characters;
- diptych/collage artifacts;
- prompt compliance;
- wall time and peak VRAM.

## Engine implementation decision

If the API workflow safely consumes the existing reference order, no new Krea
route or schema is needed. Prefer connection configuration over model-specific
Engine branching.

Only add Engine code if proof shows that variable optional references require
it. Likely touchpoints are:

- `packages/server/src/services/image/comfyui-reference-placeholders.ts`
- `packages/server/src/services/image/image-generation.ts`
- focused image reference-placeholder regressions
- `docs/media/comfyui.md` only after behavior exists

Any new user-facing connection setting must use localization and requires
`pnpm localization:check`.

## Acceptance criteria

- The workflow produces a still image without invoking the video pipeline.
- Qwen visual conditioning and `ReferenceLatent` are both present in the API
  graph.
- Location + one character and location + two characters pass the proof matrix.
- Missing optional references do not become visual subjects.
- The selected loader stack completes on the RTX 3080 without OOM.
- The API export contains the documented placeholders and a connected
  `SaveImage`.
- A real storyboard request demonstrates location-first reference ordering.
- Existing prompt-only and non-Krea image connections remain unchanged.
- If Engine code changes, prompt/reference assignment is available through
  debug logging and focused regressions plus `pnpm check` pass.

## Out of scope

- Licon MSR or any LTX conditioning in the Krea graph.
- Character training, textual inversion, or persistent character embeddings.
- Automatically publishing model files.
- Making the four-reference overflow decision without benchmark evidence.
