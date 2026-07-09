# Living Anime Game Mode: Phase 1 Plan

## Objective

Make Game Mode author turns as anime scenes from the start so narration, still
storyboards, and animation prompts share the same visual language. Keep the
existing Game Mode simulation, party, combat, journal, progression, and save
formats rather than introducing a separate top-level mode.

## Product Decision

Add a per-game experience style:

- `standard`: preserves current Game Mode behavior.
- `living_anime`: adds anime-first scene direction without changing game rules.

Existing games default to `standard`. New games can select Living Anime during
setup, and the style can be changed later from Game settings.

## Phase 1 Scope

### Anime-first narration

- Feed the experience style into initial world generation and every GM turn.
- Direct Living Anime turns as a small sequence of observable scene beats.
- Prefer concrete blocking, expressions, reactions, environmental motion, and
  continuity over abstract summaries.
- Preserve player agency, flexible turn length, mechanics, rating, language,
  custom GM prompts, and extra instructions.

### Storyboard handoff

- Include the experience style and relevant tone in storyboard context.
- Keep affordable still storyboards as single-shot, text-free illustrations.
- Make animation-source planning use clip duration and an explicit visual plan.
- Remove conflicting positive and negative instructions for comic pages.

### Animation direction

- Preserve existing single-scene video behavior for standard games.
- Add a Living Anime storyboard motion prompt that describes subject motion,
  secondary motion, timing, continuity, and the ending pose.
- Use existing storyboard motion fields instead of storing empty placeholders.
- Keep provider-specific expansion possible without coupling Game Mode narration
  to a single image or video provider.

### User controls

- Add a Living Anime experience choice to Game setup.
- Show the current experience style in existing Game settings.
- Clarify that the storyboard Animation Source Prompt creates the source image,
  while the Storyboard Motion Prompt controls the generated clip.

### Cost behavior

- Keep automatic animations opt-in.
- Do not increase the number of automatic image or video jobs for standard games.
- Use concise animation plans so expensive video calls receive useful direction.
- Leave featured-only animation and separate still/video frame counts for a
  later cost-control phase unless required for correctness.

## Non-goals

- A separate top-level Anime chat mode.
- Lip sync, episode-level editing, or automatic voice-to-video timing.
- Hard-coded genres, ratings, romance structures, or adult-content preferences.
- Provider-specific quality claims that cannot be verified locally.
- Replacing the existing Game Mode state machine or storyboard viewer.

## Compatibility

- Missing or unknown experience-style metadata normalizes to `standard`.
- Existing prompt presets remain selectable.
- Standard Game Mode prompt output remains unchanged unless needed to pass the
  experience-style value through shared builders.
- Storyboard records remain readable by current storage and serialization paths.

## Proof Plan

- Prompt regression: standard GM prompts do not receive Living Anime direction.
- Prompt regression: Living Anime GM prompts receive visual beat direction during
  setup and ordinary turns.
- Prompt regression: still storyboards remain single-shot and text-free.
- Prompt regression: animated Living Anime storyboards receive motion and
  continuity fields without contradictory comic-page negatives.
- TypeScript and ESLint: `pnpm check`.
- Prompt contracts: `pnpm regression:prompt`.
- Browser smoke: `pnpm smoke:ui` when setup/settings UI changes are complete.

## Follow-up Candidates

- Provider-aware comic-page versus single-shot animation strategies.
- Separate still-keyframe and animated-clip counts.
- Animate only the featured beat, with manual animation for remaining frames.
- Character wardrobe, injury, equipment, and prop continuity ledgers.
- Episode pacing, openings, cliffhangers, and dialogue-aware motion timing.
