# LTX Director Storyboard Integration Plan

Status: implementation plan only

## Goal

Add an optional LTX Director step to the existing storyboard video flow. The
storyboard planner remains responsible for deciding what each shot contains.
LTX Director converts one planned shot into a timed prompt that a compatible
ComfyUI LTX workflow can render.

This should reuse Marinara Engine's existing model selection, prompt overrides,
ComfyUI video provider, and scene-video storage instead of introducing another
provider or a separate editor.

## Minimal Engine Work

1. Add a small structured LTX Director plan type containing a global prompt,
   total duration, and contiguous timed segments with action, prompt, sound,
   dialogue, and warnings.
2. Add a server prompt helper that asks the user's selected language model to
   compile one storyboard shot into that structure. Normalize the result so the
   first segment starts at zero, segments have no gaps or overlaps, and the last
   segment ends at the requested duration.
3. Run the compiler immediately before video generation only when the selected
   service is ComfyUI and the configured workflow uses LTX Director placeholders.
   All existing video workflows must keep their current behavior.
4. Extend the existing ComfyUI workflow substitution with LTX-specific values:
   `%global_prompt%`, `%local_prompts%`, `%segment_lengths%`,
   `%guide_strength%`, `%timeline_data%`, and `%fps%`. Keep `%prompt%` and all
   current placeholders compatible. Do not hard-code ComfyUI node IDs.
5. Add one built-in LTX Director storyboard-video prompt preset. Show the
   compiled human-readable prompt through the existing prompt review/debug path
   and keep using the current scene-video result storage.
6. Document how to export an LTX Director workflow in ComfyUI API format and
   where to place the new placeholders.

## Initial Scope

- Compile and render one storyboard keyframe at a time.
- Use the duration already selected for that keyframe.
- Derive action, dialogue, camera, sound, style, and continuity directions from
  the existing storyboard context when available.
- Treat malformed model output as a recoverable validation error and fall back
  to the existing plain prompt path when safe.

## Non-Goals

- Cloning or embedding the Abacus application.
- Depending on Abacus as a hosted service.
- Building a new visual timeline editor.
- Adding a second ComfyUI provider or hard-coded workflow graph.
- Adding new persistent tables solely for the generated timeline.
- Combining a whole storyboard into one multi-shot render in the first version.

## Validation

- Unit-test plan parsing, duration normalization, and placeholder substitution.
- Confirm non-LTX ComfyUI workflows remain unchanged.
- Run `pnpm check` and `pnpm regression:prompt`.
- Manually render one short storyboard shot through a local LTX Director API
  workflow and verify its stored prompt, duration, preview, and final video.

## Repository Split

Engine owns the structured compiler, model/provider routing, ComfyUI workflow
integration, storyboard UI hooks, validation, storage, and documentation.

## Follow-Up TODO: Storyboard Director Agent

Create a downloadable **Storyboard Director** package in
`Pasta-Devs/Marinara-Agents` against its `staging` branch. That package should
own the reusable storyboard-planning instructions, metadata, defaults, and
assets. Engine should expose or reuse the host capability that lets the package
request a structured storyboard plan; it should not duplicate package-owned
prompts in Engine.

Before starting that follow-up, open or identify its issue, check for existing
issue-linked work, record ownership, and open a draft PR when implementation
begins. Decide there whether the downloadable agent replaces the built-in
planner or is an optional enhanced planner.
