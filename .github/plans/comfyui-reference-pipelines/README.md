# ComfyUI Reference Pipeline Plans

- Status: implementation plan only
- Planning branch: `dev/comfyui-reference-pipeline-plans`
- Baseline: `origin/staging` at `131b6e919`

## Goal

Turn the existing character and spatial-location reference assets into two local
ComfyUI render paths:

1. **Krea 2 reference-to-keyframe** for still storyboard frames and other
   non-animated scene art.
2. **LTX 2.3 MSR reference-to-video** for an optional direct video render, with
   a later hybrid variant that combines an approved keyframe with MSR visual
   memory.

These paths share source assets and prompt ownership, but they do not share a
conditioning implementation. Krea consumes Qwen3-VL image conditioning and a
reference latent. Licon MSR constructs a pseudo-video that an LTX-specific MSR
LoRA reads as visual memory. Licon MSR cannot be attached to Krea as a generic
reference encoder.

## Product model

The existing storyboard-first behavior remains the default:

```text
location + visible-character references + scene intent
                         |
                         v
                 Krea 2 keyframe
                         |
                   user approval
                         |
                         v
              keyframe -> LTX I2V
```

The new direct path is optional:

```text
location + visible-character references + motion prompt
                         |
                         v
                    LTX MSR V2
                         |
                         v
                       video
```

The desired high-control path is a later hybrid:

```text
approved Krea keyframe + character references + location reference
                         |
                         v
             LTX first-frame guide + MSR
                         |
                         v
                       video
```

The keyframe has two distinct responsibilities: a reviewable composition and a
technical video condition. MSR may replace the second responsibility, but it
does not replace the first one in the default user experience.

## Shared invariants

- The spatial-location reference remains first in Marinara's existing image
  reference array; visible-character references follow in the planner's scoped
  order.
- Only characters visible in the shot are eligible for reference slots.
- Character appearance prose and spatial instructions stay concise and
  role-specific. Reference images do not replace the text prompt.
- Normal ComfyUI editor workflows are never pasted into a connection. Every
  production workflow is tested locally, exported in API format, then stored as
  a connection snapshot.
- Workflow names and screenshots are not proof. Trace loader -> conditioning ->
  sampler -> output in the API JSON and verify the live node schemas.
- Model and node versions are recorded with every benchmark. No workflow is
  called RTX-3080-compatible until it completes on the actual 10 GB card.
- The existing `%reference_image_name%` video placeholder remains the first-frame
  contract. Supplemental MSR references get distinct role-specific placeholders.
- Existing providers and saved ComfyUI workflows remain backward compatible.

## Implementation sequence

1. Complete the manual Krea workflow proof in
   [krea2-reference-keyframe-plan.md](krea2-reference-keyframe-plan.md).
2. Repair and benchmark the LTX MSR workflow in
   [ltx23-msr-reference-video-plan.md](ltx23-msr-reference-video-plan.md).
3. Choose the proven model/node combinations before changing Engine request
   contracts.
4. Implement Krea connection integration first. The image adapter already
   uploads up to four numbered references.
5. Add the supplemental video-reference contract only after direct MSR passes
   the proof matrix.
6. Add hybrid keyframe + MSR only after direct MSR demonstrates a measurable
   identity or location benefit over ordinary keyframe I2V.

## Branch and review slicing

This planning branch contains no runtime implementation. Before implementation:

- open or confirm a maintainer-acknowledged feature request;
- identify the issue owner and any existing issue-linked branch or draft PR;
- start each implementation slice from current `origin/staging`;
- open a draft PR immediately when implementation begins;
- keep ComfyUI workflow validation and Engine integration in separate commits;
- never check manual-validation boxes on behalf of a human.

Suggested implementation branches:

- `dev/krea2-reference-keyframes`
- `dev/ltx23-msr-reference-video`
- `dev/ltx23-keyframe-msr-hybrid`

## Completion boundary

The combined effort is complete only when:

- still-only storyboard generation can use Krea with location and character
  references;
- the existing keyframe-to-animation path is unchanged by default;
- direct MSR video is opt-in and can render without a keyframe;
- the chosen MSR graph fits and completes on the RTX 3080;
- missing or fewer-than-maximum references do not become fake visual subjects;
- saved API workflow snapshots contain all required placeholders and outputs;
- debug logs show the final provider prompt and reference-slot assignment;
- focused regression checks and `pnpm check` pass for the Engine changes.
