# LTX 2.3 MSR Reference-to-Video Implementation Plan

## Objective

Add an opt-in local video path that composes a spatial-location reference and up
to four subject references directly into an LTX 2.3 video. Preserve the existing
keyframe-to-video path by default, then evaluate an approved-keyframe + MSR
hybrid as the high-control endpoint.

## Verified starting point

The local source workflow inspected during planning is:

```text
C:\Users\theto\Documents\ComfyUI\user\default\workflows\LTX-2.3_ref2vid_MSRV2_workflow.json
SHA-256: 7DCA0AD6106E107D20DECD0824B1267E5581DAB1C99D63691A94A642B8A518FA
```

The downloaded source has the same node/link topology but different serialized
bytes. Recheck both before implementation.

Observed graph facts:

- `LiconMSR` exposes four optional subject images and one required background.
- The node constructs a fixed-length IMAGE sequence with supported lengths 17,
  25, 33, 41, 49, 57, or 65.
- The output feeds `LTXAddVideoICLoRAGuide.image`.
- `LTX-2.3-Licon-MSR-V2.safetensors` is applied at strength 1.0.
- The target begins from an empty LTX video latent; the graph does not require a
  starting keyframe.
- The current saved graph has subject 1 and background enabled. Its duplicated
  reference-2 branches are bypassed; subject 4 is unconnected.
- No Marinara placeholders are present and the file is not an API export.

Current local blockers observed during planning:

- `ComfyUI-Licon-MSR` loads and `LiconMSR` appears in live `object_info`.
- `ComfyUI-LTXVideo` fails to import after the current ComfyUI update because it
  imports the removed `interleaved_freqs_cis` symbol. Consequently
  `LTXAddVideoICLoRAGuide` is missing from live `object_info`.
- The graph expects the official LTX 2.3 dev checkpoint, the official distilled
  LoRA, the MSR V2 LoRA, and specific Gemma/audio assets. The exact checkpoint
  and LoRA filenames were not found in the active model roots during planning.
- The graph is oriented toward the full 22B stack. The RTX 3080 has 10 GB VRAM,
  so the existing INT8 ConvRot path must be tested rather than assumed
  compatible.

## MSR behavior and reference allocation

MSR does not create a reusable character embedding. Licon turns the static
references into a pseudo-video, which the LTX VAE encodes into visual tokens for
the target video's self-attention.

Map roles as follows:

```text
Licon background = spatial-location reference
Licon subject 1  = primary visible character
Licon subject 2  = secondary visible character
Licon subject 3  = tertiary visible character or important prop
Licon subject 4  = fourth visible character or important prop
```

Use the shortest Licon reference sequence that gives each connected subject a
separate temporal latent allocation:

| Connected subjects | Background | Initial reference length |
| ------------------ | ---------- | ------------------------ |
| 1                  | required   | 17 frames                |
| 2                  | required   | 17 frames                |
| 3                  | required   | 25 frames                |
| 4                  | required   | 33 frames                |

These are starting values derived from Licon's 8x temporal VAE allocation, not a
quality guarantee. Longer values require controlled proof before becoming a
default.

## Product modes

### Existing keyframe mode

```text
approved storyboard illustration -> `%reference_image_name%` -> LTX I2V
```

This remains the default and must not change behavior.

### Direct MSR mode

```text
location + visible characters + action prompt -> LTX MSR -> MP4
```

This mode has no pre-render composition approval. It must be opt-in. If surfaced
inside Storyboards, extract a poster frame only after video completion and label
the route accurately; do not imply that the poster was an approved input frame.

### Hybrid mode

```text
approved keyframe as frame-zero guide
+ location/character MSR visual memory
+ motion prompt
-> MP4
```

Hybrid mode is a later phase. Do not add it until direct MSR demonstrates a
measurable consistency benefit and the graph topology proves that the first-frame
guide and MSR guide can coexist without over-conditioning or static output.

## Phase 0: restore the reference graph

1. Preserve the current ComfyUI install and record core, frontend, custom-node,
   Python, PyTorch, CUDA, and driver versions.
2. Check the upstream `ComfyUI-LTXVideo` fix before modifying local code.
3. Prefer an upstream-compatible node update. If none exists, test either a
   reversible custom-node compatibility patch or a pinned pre-removal ComfyUI
   install; do not edit the canonical installation without a backup and exact
   rollback point.
4. Restart ComfyUI and prove these nodes exist in live `object_info`:
   `LiconMSR`, `LTXAddVideoICLoRAGuide`, the selected prompt encoder, LTX
   conditioning/crop nodes, sampler, and MP4 output.
5. Queue the source graph far enough to expose the next missing model or input.

Exit criterion: the workflow is structurally queueable and no required node is
missing.

## Phase 1: select a 10 GB model combination

The source graph applies a distilled LoRA and MSR LoRA to the official dev model.
The local INT8 checkpoints may already include distillation or other merges.
Avoid double distillation.

Test these candidates only where their model metadata and loader support make
them valid:

1. a quantized LTX 2.3 dev base + intended distilled LoRA + MSR V2;
2. the existing distilled/merged INT8 ConvRot model + MSR V2 only;
3. another known-compatible 10 GB LTX 2.3 base only if candidates 1 and 2 fail.

Freeze references, prompt, seed, target frames, dimensions, sampler, and guide
strength. Begin at the lowest representative resolution and a short target
clip. Record load time, render time, peak VRAM/RAM, frame count, and output
quality.

Exit criterion: one MSR V2 render completes on the RTX 3080 without OOM, and its
reference consistency is visibly better than a text-only control.

## Phase 2: prove direct MSR quality

Use simple duration-aware prompts. For 1-6 seconds, direct one action and one
camera setup. Describe reference roles accurately without repeating every static
detail.

Example proof prompt:

```text
The silver-haired woman from the primary character reference stands beside the
metal doorway in the rooftop location reference. She walks three steps toward
the center and looks over the city railing as the static medium-wide camera
holds. Preserve her face, black jacket, red scarf, rooftop architecture, and
dawn lighting. Wind moves her scarf lightly and the action settles at the rail.
```

Run at least three seeds per row:

| Row | References                  | Action                    | Expected proof                                |
| --- | --------------------------- | ------------------------- | --------------------------------------------- |
| M1  | one character + location    | simple walk/turn          | identity and location retained                |
| M2  | two characters + location   | no interaction            | both subjects remain distinct                 |
| M3  | two characters + location   | one simple interaction    | relationship follows prompt                   |
| M4  | three characters + location | simple blocking           | 25-frame reference allocation works           |
| M5  | four characters + location  | static blocking           | 33-frame allocation works or limit documented |
| M6  | location only control       | camera/environment motion | no invented reference subject                 |
| M7  | same prompt without MSR     | control                   | measurable MSR benefit                        |
| M8  | repeated fixed seed         | stability                 | workflow/model determinism characterized      |

Score identity, clothing, location landmarks, subject count, spatial placement,
motion, temporal drift, flicker, prompt compliance, audio behavior, wall time,
and peak VRAM.

## Phase 3: export a direct MSR API workflow

The first API proof may use separate fixed workflows for one, two, three, and
four subjects. This avoids pretending that blank placeholder images are absent
subjects. Do not commit to the final dynamic-reference mechanism until the model
proof passes.

The production design should supply role-specific placeholders:

| Purpose                | Proposed placeholder                               |
| ---------------------- | -------------------------------------------------- |
| Prompt                 | `%prompt%`                                         |
| Target dimensions      | `%width%`, `%height%`                              |
| Target frame count     | `%length%`                                         |
| Duration               | `%duration_seconds%`                               |
| Seed                   | `%seed%`                                           |
| Background/location    | `%background_reference_image_name%`                |
| Subject slots          | `%subject_reference_image_name_01%` through `_04%` |
| Licon reference length | `%msr_reference_length%`                           |

Do not reuse `%reference_image_name%` for the location or a subject. It already
means the first-frame image in existing video workflows.

### Optional-reference decision gate

Comfy API exports normally retain only connected inputs. A fixed graph with four
`LoadImage` nodes cannot represent a missing subject by uploading a 1x1 image;
Licon would treat it as another subject. Choose one proven approach:

1. a small maintained Comfy custom node that loads optional filenames and returns
   `None` for blank subject slots before `LiconMSR`;
2. a safe Engine template operation that omits absent optional inputs while
   preserving the rest of the API graph;
3. connection-selected workflow variants for each supported subject count.

Prefer the smallest option with a clear owner and regression surface. Do not
ship duplicate-reference or blank-reference backfills as a shortcut.

## Phase 4: Engine supplemental-reference contract

Current `VideoGenerationRequest` accepts one `referenceImage`, and local ComfyUI
uploads it only when `%reference_image_name%` exists. Storyboard rendering always
generates and saves an illustration before invoking video generation.

Add a backward-compatible supplemental contract after workflow proof. Suggested
shape:

```ts
interface ComfyUiVideoReferenceBundle {
  background?: VideoReferenceImage | null;
  subjects?: VideoReferenceImage[];
}

interface VideoGenerationRequest {
  referenceImage?: VideoReferenceImage | null; // existing first frame
  comfyReferenceBundle?: ComfyUiVideoReferenceBundle;
}
```

Keep the bundle ComfyUI-specific until another provider has matching semantics.
Do not silently send MSR subjects to cloud providers as multiple first frames.

Likely Engine touchpoints:

- `packages/server/src/services/video/video-generation.ts`
- `packages/server/src/routes/game.routes.ts`
- `packages/server/src/routes/gallery.routes.ts` if Gallery exposes direct MSR
- `packages/server/src/routes/connections.routes.ts` for connection testing
- shared schemas/settings only if a user-selectable render mode is added
- client settings and English localization only if the mode is surfaced in UI
- focused video placeholder and reference-upload regressions

Required adapter behavior:

- upload the background and each subject once;
- preserve subject order and cap it at four;
- replace only declared role-specific placeholders;
- resolve absent slots according to the chosen optional-reference strategy;
- derive or validate `%msr_reference_length%` from connected subject count;
- log the final prompt plus role/slot assignment in debug mode without logging
  image bytes;
- retain fallback behavior and cancellation signals;
- leave all existing first-frame providers unchanged.

## Phase 5: direct Storyboard integration

Direct MSR must be an explicit render mode, not an accidental consequence of a
missing keyframe. Proposed behavior:

- `keyframe` remains the default and follows the existing image -> video path;
- `references` supplies the already collected location and visible-character
  assets to the MSR workflow;
- if a direct render is requested, status and error messages identify video
  generation rather than illustration animation;
- a failed direct video does not fabricate an approved keyframe;
- fallback planning does not start video generation with unreviewed raw
  narration.

Decide whether direct MSR belongs first in a developer-only connection test,
Gallery action, or Game Mode only after manual proof. Avoid a large Storyboard UI
change in the same slice as the adapter contract.

## Phase 6: hybrid keyframe + MSR

1. Start from the winning direct MSR graph.
2. Add the approved storyboard image through the standard frame-zero guide while
   preserving the separate MSR pseudo-video.
3. Freeze the same prompt, keyframe, references, seed set, and target duration.
4. Compare ordinary keyframe I2V, direct MSR, and hybrid.
5. Tune one variable at a time: first-frame strength, MSR strength, reference
   length, then sampling.
6. Reject the hybrid if it produces static motion, over-constrained composition,
   duplicate characters, or materially worse runtime without a consistency gain.

Hybrid becomes the default animation candidate only if it preserves the approved
composition and improves identity/location continuity over ordinary I2V.

## Acceptance criteria

- Required LTX custom nodes load in the live ComfyUI runtime.
- The chosen MSR V2 stack completes a short render on the RTX 3080.
- One-, two-, and three-character reference rows pass the proof matrix; four
  characters are either proven or explicitly limited.
- Direct mode renders from references without a keyframe.
- Existing keyframe-to-video generation remains the default and is unchanged.
- Missing subject slots are omitted, not represented by blank or duplicate images.
- The direct API workflow has role-specific placeholders and a connected MP4
  output.
- Engine debug logs show prompt, subject count, role order, target frames, and
  workflow selection without exposing image data.
- Cancellation, fallback, output download, and orphan cleanup remain intact.
- Focused regressions, `pnpm regression:prompt` where prompt behavior changes,
  `pnpm localization:check` for UI copy, `pnpm check`, and `git diff --check`
  pass for implementation changes.

## Out of scope

- Replacing the storyboard-first default with direct video.
- Treating MSR references as persistent character embeddings.
- Applying the Licon MSR LoRA to Krea.
- Downloading or redistributing third-party model weights from Marinara Engine.
- Claiming official 22B workflow capacity on a 10 GB GPU without a measured
  successful render.
