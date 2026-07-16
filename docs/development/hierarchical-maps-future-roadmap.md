# Hierarchical Maps: Post-V3 Future Roadmap

Status: Exploratory future TODO; Maps 1.0.6 is published and a package-owned 1.1.0 recovery candidate is checkpointed, still blocked on generic host isolation and full V3 stabilization

Related work:

- [`hierarchical-locations-prd-v3.md`](./hierarchical-locations-prd-v3.md) defines the original architecture and delivery plan.
- [PR #3565](https://github.com/Pasta-Devs/Marinara-Engine/pull/3565) established the first hierarchical-map, spatial-context, and location-lore foundation.
- [PR #3613](https://github.com/Pasta-Devs/Marinara-Engine/pull/3613) moved hierarchical maps into the optional-agent/package system.
- [`hierarchical-maps-addon-recovery-plan.md`](./hierarchical-maps-addon-recovery-plan.md) governs restoration of the extracted package before this future roadmap continues.
- [Marinara Engine PR #3644](https://github.com/Pasta-Devs/Marinara-Engine/pull/3644) and
  [Marinara Agents PR #15](https://github.com/Pasta-Devs/Marinara-Agents/pull/15)
  shipped the paired 1.0.1 compatibility recovery.
- [Engine issue #3651](https://github.com/Pasta-Devs/Marinara-Engine/issues/3651),
  merged [PR #3652](https://github.com/Pasta-Devs/Marinara-Engine/pull/3652), and
  [Marinara Agents issue #16](https://github.com/Pasta-Devs/Marinara-Agents/issues/16)
  track the Phase 2 host contract and package-owned source migration.
- [Marinara Agents issue #34](https://github.com/Pasta-Devs/Marinara-Agents/issues/34)
  and merged [PR #35](https://github.com/Pasta-Devs/Marinara-Agents/pull/35)
  delivered the Maps `1.0.6` UI, Game-map authority, and generated-turn recovery
  to Agents `staging`.

## Implementation checkpoint — July 15, 2026

PR #35 restored a meaningful portion of Workstreams 1 and 2 without starting the
future travel modes:

- the full-screen editor and shared in-chat Roleplay/Game hierarchical map are back;
- Game presents the hierarchy as `World` authority and keeps the legacy map as
  bound `Local` or tactical detail;
- reviewed Game setup persists matching bindings in both the active map projection
  and selected `gameMaps` entry;
- generated prose, command-like text, party markers, and `[map_update]` cannot move
  the hierarchy; only an explicit owner-selected transition committed with the
  owner turn can;
- the downloadable package reconciles its pending move after accepted and stale
  Roleplay turns;
- focused desktop/mobile and generated-turn tests pass, the catalog is valid, and
  all actionable CodeRabbit threads on the PR are resolved.

This checkpoint is not the recovery exit gate. Follow-up commits on the existing
`feature/hierarchical-maps-package-source-16` branch moved Maps-owned source into
the package at `dad64e1`, then built a `1.1.0` candidate with reviewable
existing-campaign reconciliation at `1948183`. Exact-artifact coverage now updates
from Maps `1.0.5` through `1.0.6` to `1.1.0`, rejects partial reconciliation writes,
proves retry safety, and covers offline restart, remove, reinstall, full-backup
creation, and full-backup restore while preserving the definition and spatial
snapshot.

The recovery exit gate still requires a narrow generic host contract in place of
captured Engine internals, the complete history/prompt matrix,
accessibility/theme review, and manual lifecycle proof. No new issue, pull request,
screenshots, or recordings were added, and future travel modes have not started.

A hands-on first-map walkthrough on July 15 also exposed a separate product gap.
The user had to install Maps, install an offered update, restart, activate Maps
again under the chat's Tracker Agents, scroll back to the newly mounted map
setting, enter the editor, start AI drafting, accept a top-level-only preview,
expand a collapsed working hierarchy, find the starting-location control, enable
the map, and save it. Rejecting the unsaved draft required leaving the editor,
discarding changes, reopening it, and starting again. This flow works, but its
safety boundaries and next actions are not understandable enough. Workstream 2
now treats first-map creation as a required product slice rather than incidental
editor polish.

The walkthrough also exposed a false global setup route. Opening **Agents →
Hierarchical Maps** presents the generic pipeline-agent editor with empty prompt,
named-option, connection, tool, and execution fields. Maps declares feature-owned
execution and has no default prompt or settings, so these controls are inapplicable
and make the installed package appear unfinished. The offered immediate update was
observed during a catalog transition; a fresh current-version install should not
normalize that extra step.

## Purpose

This document records possible work after the V3 foundation. It exists because
the next product and architecture choices still have important unknowns. It does
not revise the merged PRD, promise every item below, or authorize a large follow-up
implementation.

Future work should make the existing foundation produce a noticeably better play
experience. It should not add more authoring systems merely because the data model
can support them.

Each accepted slice should receive its own issue, visible owner, draft pull
request, success criteria, and proof plan under the repository workflow. Work in
Marinara Engine targets `staging`. If the optional package becomes the canonical
implementation, its repository and workflow become the implementation target
instead.

## Working baseline

The following is the planning assumption, not a substitute for reviewing the
merged diff or revalidating the extracted package:

| Area                                         | Working status                                                                     | Follow-up treatment                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| V3 Packages A through F                      | Foundation delivered by PR #3565                                                   | Stabilize and revalidate after extraction                                    |
| V3 Package F.1: location lore bindings       | Foundation delivered by PR #3565                                                   | Verify eligibility, prompt parity, history, and token bounds                 |
| V3 Package F.2: lorebook-grounded drafting   | Foundation delivered by PR #3565                                                   | Retain only if it proves useful; avoid more generation modes                 |
| V3 Packages F.3 and F.3.1: visual references | Not assumed delivered                                                              | Re-evaluate as separate product work rather than automatically continuing V3 |
| V3 Package G: Connected Conversation         | Not assumed delivered                                                              | Re-evaluate after the owner experience proves value                          |
| Optional-agent extraction                    | 1.0.1 shipped; 1.0.6 is in the main catalog; source migration remains in progress  | Complete package-owned source and cross-repository proof before feature work |
| Destination routing                          | Local design/helper work exists, but is not a finished feature                     | Redesign around selectable travel pace before continuing                     |
| First-map creation                           | Functional, but activation, draft review, rejection, and first save are fragmented | Build one guided creation path before adding more authoring modes            |

This roadmap deliberately does not inherit every unfinished V3 package. A later
package must still justify its user value, size, and maintenance cost.

## Product principles

1. **Build vertically toward play value.** Prefer a complete destination-selection
   experience over another independent subsystem.
2. **Let the player choose the pace.** Fast travel, a narrated journey, and
   turn-by-turn exploration serve different moments and should not be forced into
   one behavior.
3. **Keep the model's context local and bounded.** The current location and useful
   route facts belong in context; the entire world does not.
4. **Use progressive disclosure.** Players see location and travel controls.
   Creators explicitly enter editing, AI drafting, provenance, archive, and repair
   tools.
5. **Preserve one spatial authority.** Roleplay and Game may present the map
   differently, but current location and route validation must use the same
   authoritative state.
6. **Do not accidentally build a generic scenario engine.** Spatial state may use
   state-machine ideas without absorbing generic flags, events, scripts, or action
   inference.
7. **Measure before expanding.** More spatial features are justified only if the
   system reduces model mistakes, improves navigation, or materially reduces
   creator effort.

## Decision gate 0: settle the optional-package transition

The ownership decision is resolved, while the package-owned source migration is in
progress. Feature work should still wait until extraction establishes the safe
source of truth. Documentation and design can continue during that refactor.

Recorded maintainer decision:

- Marinara Agents is the only implementation and pull-request target for Agent and
  Hierarchical Maps source, fixes, behavior, versions, manifests, generated
  bundles, archives, and catalog entries.
- Marinara Engine owns only generic host contracts, inert integration points,
  compatibility persistence, lifecycle behavior, and fallback surfaces.
- A Maps change that depends on Engine support uses paired draft pull requests and
  exact-artifact proof. Required Engine support lands before the Agents catalog
  advertises the new package version.
- Generated package payloads remain artifacts, never editable source of truth.

Resolve the remaining questions with the maintainer:

- Which code remains in Engine as stable host contracts, extension slots, data
  ownership, and compatibility behavior?
- Which code belongs to the optional package: editor UI, runtime UI, route
  planning, prompt projection, server handlers, migrations, and regression tests?
- Can a package contribute shared schemas and prompt behavior without a generated
  bundle becoming the editable source of truth?
- What happens to existing map data when the package is absent, disabled,
  upgraded, removed, or reinstalled?
- How are package data migrations versioned, backed up, restored, imported, and
  rolled back?
- Can chats containing spatial snapshots remain readable when the package is not
  installed?
- Where do cross-boundary tests live, and which repository owns failures?
- How should the current uncommitted route-planning work be carried forward after
  the source boundary is decided?

Desired boundary:

- Engine owns a stable, inert package host and any generic persistence or request
  contracts required by optional packages.
- The hierarchical-maps package owns map-specific authoring, runtime travel,
  projections, and focused tests.
- Generated bundles are build artifacts, not hand-edited implementation sources.
- Removing the package hides behavior without silently deleting user maps or
  corrupting chat history.

Do not add route behavior in both repositories while this boundary is unsettled.

## Workstream 1: stabilize the delivered foundation

This is the first implementation work after the package boundary is known. It
adds no new product capability.

### Correctness

- Make current-location lore activation consistent across live generation, Game
  GM generation, dry run, live Peek Prompt, and cached Peek Prompt.
- Ensure disabled folders, books, and entries cannot be attached or activated as
  usable location lore.
- Make client attachability rules match the server's final lorebook eligibility
  rules.
- Fix cleanup when tactical and spatial pending movements coexist.
- Keep archived locations referenced by historical snapshots readable without
  making them valid new destinations.
- Verify that current location resolves correctly after continuation,
  regeneration, swipes, earlier-message branches, message deletion, and Game
  checkpoint restore.
- Verify idempotency and stale-definition handling for movement commands.
- Preserve legacy behavior for old-map-only, hierarchy-only, combined, and
  spatial-disabled configurations.

### Runtime and authoring proof

- Complete real-browser verification on desktop and mobile.
- Verify dark, light, and SillyTavern themes.
- Check touch targets, keyboard operation, focus order, long names, deep
  breadcrumbs, empty maps, invalid maps, and revision conflicts.
- Ensure the map editor cannot be covered by global floating UI on small screens.
- Confirm imported, restored, or branched chats retain the expected definition,
  current location, lore attachments, and warnings.

### Exit gate

The extracted package and Engine host pass the applicable repository checks and a
focused spatial regression. Known prompt, eligibility, history, and mobile issues
are either fixed or recorded as explicit blockers. No new travel feature begins
on an unverified state foundation.

## Workstream 2: make map creation and runtime understandable

The current system exposes substantial authoring power, but neither first-map
creation nor ordinary play should require the user to understand package state,
working-copy semantics, graph storage, or prompt architecture.

### Creation and activation

The first-map flow should become one explicit sequence:

```text
Install or update package
  -> activate for this chat
  -> build
  -> review the complete hierarchy
  -> confirm starting location
  -> enable and save
```

Implement the smallest coherent version of that sequence:

- After Hierarchical Maps is enabled under Tracker Agents, show a direct
  `Create map` action when the chat has no definition and `Open map` when it does.
  Do not require the user to scroll until they discover a separately mounted
  configuration card.
- Keep package availability and per-chat activation distinct, but present
  `Install`, `Update`, `Restart required`, `Activate for this chat`, and
  `Configure map` as an ordered readiness path rather than repeated enablement.
- A fresh install of the current catalog version should not immediately offer an
  update. Treat that result as a version/readiness defect to investigate, not a
  permanent step in the creation funnel.
- When a downloaded agent declares feature-owned execution, replace the generic
  pipeline-agent editor with a generic feature-detail host. Let the package mount
  a feature-owned global page; fall back to a read-only summary only when no page
  is contributed.
- Make the package-owned Maps page the global home for installed version,
  readiness or restart state, supported modes, concise help, current-chat
  activation and map status, `Create map` or `Open map`, and `Manage package`.
- Evaluate genuine global Maps defaults there: draft and expansion sizes,
  reusable world-building guidance, an optional generation connection override
  that defaults to the chat connection, and an advanced package-owned generation
  prompt override with visible default and reset behavior. Do not expose a setting
  until it is wired to real package behavior.
- Keep hierarchy contents, starting and current location, selected lorebooks,
  Game bindings, enabled state, committed history, and unsaved drafts scoped to
  their chat.
- Use stable language for `Installed in Marinara`, `Active in this chat`,
  `Working draft, not saved`, `Saved, map disabled`, and `Saved, map active for
turns`.
- Present first creation as four clear stages, `Build`, `Review`, `Start here`,
  and `Enable map`, inside one workspace. Treat them as a compact progress strip
  or state checklist, not four new mandatory pages. Existing maps and returning
  users bypass first-map guidance.
- Label the generated result as a working draft that is not saved or active yet.
- Replace the top-level-only Draft preview with a recursively browsable hierarchy
  that shows every generated location, total location count, maximum depth,
  proposed starting location, validation issues, and optional lore provenance.
- Let the user inspect a generated location's public description and private
  model memory before accepting the draft.
- Keep large previews bounded: expand only the first useful level, provide search,
  expand/collapse and issue filters, and use incremental or virtualized rendering
  if measurement shows it is needed.
- The limited preview already offers `Generate another`; make that capability
  prominent as `Regenerate`, then keep `Edit prompt` and `Continue to editor`.
  The last label should make the local working-copy boundary clearer than `Use
this draft`.
- When the draft enters the editor, expand the root and one useful descendant
  level, select the proposed starting location, and show a compact summary such
  as `16 locations · 4 levels · not saved`.
- Keep `Discard draft` and `Regenerate` available until the first save. Do not
  require leaving the editor and reopening it merely to reject an unsaved result.
- Preserve the generation inputs and generated candidate until first save.
  Regeneration after complete inspection replaces only the applied generated
  draft after confirmation; it does not silently discard unrelated manual edits,
  imports, or saved work.
- For a valid new map, provide one primary `Enable and save map` action. If the
  starting location is missing, open a focused chooser from that action.
- Retain ordinary Save and Enabled controls for later editing and temporary
  deactivation.
- End the first successful save with a concrete summary such as `Map ready · 16
locations · Starting at Tideglass Inn`, one `Return to chat` action, and a cue
  explaining where Story location now appears.
- Make `Expand with AI` default to the currently selected location and initially
  ask only what should be added and how large the expansion should be. Put setup
  versus lore grounding, lorebook selection, and replacement under progressive
  `Advanced options`.
- Before committed history exists, expose replacement as a clearly destructive
  alternative. After committed history exists, preserve the current stable-ID
  protection and explain why replacement is unavailable.

This slice crosses repository ownership:

- Marinara Engine owns catalog readiness, the generic feature-detail host and
  contribution contract, per-chat Tracker Agent activation, contribution
  placement, scroll/focus behavior, and any generic capability contract needed
  to carry readiness or navigation state.
- Marinara Agents owns the package-provided global Maps page, global Maps defaults
  and validation, the package editor, AI builder, recursive preview, draft
  rejection/regeneration, starting-location confirmation, first-save flow, and
  expansion progressive disclosure.

Start with the highest-value Agents-owned slice where possible: recursive review,
applied-draft regeneration, starting-location confirmation, first-save completion,
and simplified expansion. Keep Engine follow-up generic and narrow. Do not block
package-owned editor work on Engine changes unless a genuinely shared host contract
is required, and do not move package-owned map UI back into Engine to simplify the
funnel.

### Runtime world map

Create a shared runtime world-map experience for Roleplay and Game:

- Make the current location immediately obvious.
- Let the user select a place to inspect its public description and relationship
  to the current location.
- Offer clear actions such as `Go here`, `Set destination`, and `Explore inside`.
- Show reachable destinations without requiring the user to understand graph
  edges, hierarchy rules, provenance, or prompt injection.
- Use the same world-map component and travel semantics in Roleplay and Game.
- In Game, provide a simple `World` / `Local` switch:
  - `World` shows hierarchical story locations.
  - `Local` shows the existing tactical grid or node map.
- Keep editing, AI drafting, source provenance, archive controls, validation, and
  repair tools in creator mode.
- Preserve accessible list navigation even when a positioned or layered map is
  available.

This workstream should clarify the relationship between the old and new maps:
the old map remains useful for tactical position inside a place, while the
hierarchical map describes story-scale location and travel between places.

### Exit gate

A new user can move directly from per-chat activation into map creation, inspect
the complete AI-generated hierarchy before accepting it, reject and regenerate an
unsaved draft in place, confirm the starting location, and enable and save the
first map without inferring hidden steps. The global feature entry presents a
package-owned Maps home with meaningful defaults and current-chat actions instead
of irrelevant pipeline-agent fields. First save reports what became active and
returns the user to play. During play, the user can identify where they are,
inspect a destination, and start the intended kind of travel without opening
creator controls or learning the storage model.

## Workstream 3: destination planning with player-controlled pace

Requiring one chat turn for every location hop would make long routes tedious,
especially in Game mode. The route should still be validated, but graph edges do
not always need to become separate LLM turns.

### Destination experience

Selecting any reachable active destination opens a route preview:

```text
Destination: Observatory
Route: Market -> Castle -> Tower -> Observatory

[Travel now]
[Narrate journey]
[Explore each stop]
[Add waypoint]
[Set as goal]
```

For an adjacent destination, the UI may collapse this to a simple `Go here`
action while retaining the other options through a secondary control.

### Travel modes

| Mode              |       Model turns | Lore/context behavior                                                                | Intended use                                  |
| ----------------- | ----------------: | ------------------------------------------------------------------------------------ | --------------------------------------------- |
| Travel now        |                 0 | Validate the full route; commit the destination; activate destination lore only      | Hurry, backtracking, routine travel           |
| Narrate journey   |                 1 | Supply a bounded route summary; generate one montage; then activate destination lore | Preserve atmosphere without several turns     |
| Explore each stop |       One per leg | Use the existing one-hop validation and normal per-location context                  | Discovery, encounters, deliberate exploration |
| Set as goal       | 0 and no movement | Save route intent and show the next useful action                                    | Guidance without committing travel            |

`Travel now` is not unrestricted teleportation. It follows a valid route but
compresses uneventful traversal into one state change. `Narrate journey` similarly
uses one validated route and one bounded narration rather than secretly running
several turns.

### Route selection

- The default fastest route initially means the fewest valid graph connections.
- A scenic route initially means user-selected waypoints. Do not claim that a
  route is scenic without authored metadata.
- If users later need meaningful alternatives, add optional edge metadata such
  as distance, travel time, danger, accessibility, or scenic tags in a separate
  proposal.
- Hidden, blocked, archived, missing, or disconnected locations are not valid
  destinations or route steps.
- The client may preview a route, but the server recomputes and authoritatively
  validates it before committing movement.
- `Travel now` and `Narrate journey` validate the complete route atomically.
- `Explore each stop` retains the current one-move-per-turn validation contract.
- If the current location or definition revision changes, the displayed plan
  becomes `Needs review` rather than silently choosing a different journey.
- Do not implement unattended multi-turn background travel.

### Context budget

- `Travel now` injects no intermediate location memories; the accepted
  destination becomes current and supplies its normal bounded context.
- `Narrate journey` receives only the route facts needed for a coherent montage:
  bounded location names, edge labels, selected waypoint notes, and relevant
  authored travel metadata. It does not activate every intermediate lorebook.
- `Explore each stop` activates the normal current-location context after each
  accepted leg.
- Prompt previews must identify the travel projection and any truncation.

### History and persistence questions

An instant transition with no model call still needs an inspectable history
anchor. Decide whether this is a lightweight travel event, a typed system record,
or another snapshot-bearing mechanism. The solution must support reload, branch,
export/import, deletion, and checkpoint behavior without inserting fake user
dialogue.

The travel-plan draft should evolve from a single `nextStep` helper into a typed
plan containing, at minimum, destination, route, travel mode, optional waypoints,
expected current location, and expected definition revision. The exact wire
schema remains open until the package boundary and history anchor are decided.

### Exit gate

Users can choose a distant destination, understand the route, and select fast,
narrated, stepwise, or guidance-only travel. The server rejects a stale or
invalid route without partially moving the chat, and history restores the same
accepted destination.

## Workstream 4: prove that the spatial system earns its complexity

Compare these configurations with identical maps, transcripts, models, and
generation settings:

1. Existing Game map only.
2. Existing map plus ordinary lorebooks.
3. Hierarchical spatial context plus attached location lore.

Measure:

- Whether the model correctly names the current room or area.
- Whether it avoids describing inactive locations as present.
- Whether it identifies only valid exits.
- Whether movement changes its answer on the next generation.
- Whether swipes, branches, reload, and checkpoints restore the right place.
- Prompt-token cost at shallow, deep, wide, and heavily authored locations.
- Generation latency attributable to spatial context.
- Time and actions required to author the same playable world.
- User success in finding and using travel controls.

Define acceptable thresholds before running the comparison. If the hierarchy
does not measurably reduce spatial mistakes or improve authoring/navigation, stop
expanding it and simplify the surface.

## Workstream 5: creator starter maps

If the runtime and evaluation gates succeed, implement the original creator
value proposition: a character or Game template can provide a pre-made starting
map.

- A template references a starter map rather than sharing mutable live state.
- Starting a chat copies the map so each user owns an independent definition.
- Preserve stable location and lore references where possible.
- Warn about missing lorebook entries or unavailable optional-package features.
- Never overwrite a map that already has committed spatial history.
- Keep first-version updates simple; do not invent a general campaign merge
  system.
- Define export and licensing behavior before bundling lorebooks or image assets.

### Exit gate

A creator can distribute an intentional starting world, and a user can begin a
new independent chat from it without damaging existing campaigns or silently
losing referenced lore.

## Workstream 6: constrained model-requested movement

Consider this only after manual travel is dependable and its validation API is
stable.

- Expose a typed destination request using stable location IDs.
- Let the existing server route and movement validators decide whether it is
  possible.
- Require visible user approval before committing movement unless a later product
  setting explicitly establishes a narrower trusted behavior.
- Show why a requested destination is unavailable.
- Keep model-requested movement out of visible prose and out of free-form name
  parsing.
- Do not add a separate action-inference LLM merely to select movement.

### Exit gate

The model can suggest a valid destination without bypassing user control, route
rules, spatial history, or prompt budgets.

## Separate RFC: generic reactive scenarios

The Voxta-inspired mental model is useful:

```text
state
  -> select current context and available actions
  -> generate or handle an event
  -> apply validated effects
  -> update state
```

Hierarchical maps should remain one typed application of that loop. If Marinara
later wants general scenario behavior, write a separate RFC covering:

- Generic flags and variables.
- Conditional contexts.
- Actions, effects, events, and lifecycle timings.
- Persistence, branching, and replay semantics.
- Permissions and safety for scripts or app triggers.
- Inference cost, observability, and failure behavior.
- Interaction with optional packages and uninstallation.

Do not grow these mechanisms inside location schemas or travel handlers. A map
feature should not become the de facto scenario engine without an explicit
architecture decision.

## Explicitly postponed

The following ideas remain recorded but are not next-step scope:

- Additional AI map-generation modes.
- Generic flags, variables, events, scripts, effects, or scenario inheritance.
- A separate action-inference model.
- Independent positions for every character.
- Per-character spatial knowledge or fog of war.
- Irregular geographic borders.
- Image-to-map or 2D-to-3D inference.
- 3D world rendering.
- Location visual-reference and Storyboard integrations from V3 Packages F.3 and
  F.3.1, pending a new value and size review.
- Connected Conversation projection from V3 Package G, pending a privacy and
  value review.
- Automatic multi-turn travel.
- AI-selected "scenic" routing without authored route metadata.
- A general quest engine; quest destinations may integrate later through a small,
  typed contract.
- Portable campaign packages that merge live maps, lorebooks, and image assets.
- Automatic promotion of generated content into map canon.

## Suggested delivery order

The order below is a planning sequence, not a single implementation project. The
Engine manifest prerequisite landed in PR #3652, while item 1 remains active
through Marinara Agents issue #16. Merged PR #35 advances part of items 2 and 4 but
does not complete either exit gate:

1. Finish the package-owned source migration and exact-artifact compatibility
   proof in Marinara Agents, with only generic paired host support in Engine.
2. Stabilize and revalidate the extracted V3 foundation.
3. Simplify global feature-agent presentation, package-to-chat activation,
   first-map creation, recursive draft review, rejection/regeneration,
   starting-location confirmation, and first save.
4. Build the shared Roleplay/Game runtime world-map surface.
5. Implement destination preview and `Travel now` with an explicit history
   anchor.
6. Add `Narrate journey`, `Explore each stop`, waypoints, and `Set as goal` as
   independently reviewable slices.
7. Run the old-map/lorebook/hierarchical-map comparison and decide whether the
   feature has earned more investment.
8. Add creator starter maps if the result is positive.
9. Consider constrained model-requested movement.
10. Re-evaluate each postponed V3 package separately.

Do not begin all numbered items under one issue or pull request.

## Open questions register

Before dependent implementation, convert the relevant questions into decisions on
the tracking issue. Canonical source ownership is already resolved in favor of
Marinara Agents:

- What remains readable when the optional package is absent?
- What is the durable history anchor for zero-turn travel?
- Is the route API a single destination request or an explicit client-proposed
  route checked by the server?
- How are waypoints represented and validated?
- Which route facts are sufficient for one narrated journey?
- What are the prompt and lore budgets for that narration?
- Does fast travel require creator-authored restrictions beyond graph reachability?
- Should adjacent `Go here` default to instant movement or preserve the current
  send-with-next-turn behavior?
- How does a Game quest identify a spatial destination without making the map
  depend on a future quest engine?
- Which controls appear in Roleplay, Game World, and Game Local views?
- Should per-chat activation open the creator immediately, focus a newly mounted
  card, or keep both behaviors behind an explicit `Create map` action?
- What generic contribution should let every feature-backed Agent provide a
  package-owned global page, and what fallback summary should Engine show when it
  does not?
- Which Maps defaults are genuinely global, and which would create surprising
  cross-chat behavior if moved out of the chat workspace?
- How much generated hierarchy must remain visible at once on mobile and for
  large maps while still making Draft preview truthful?
- Can first activation combine starting-location confirmation, Enabled, and Save
  without making later temporary disablement or revision-conflict handling less
  explicit?
- What metrics and thresholds determine whether the feature is worth retaining?
- Which unfinished V3 packages still solve an observed user problem after the
  runtime travel experience is complete?

Unknown answers should block only the dependent slice, not unrelated
stabilization, documentation, or evaluation work.

## Proof expectations for future pull requests

Every accepted slice must identify its core claim and verify the relevant rows:

| Area               | Minimum proof                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package transition | Install, enable, disable, upgrade, remove, reinstall, backup, and restore without silent data loss                                                                                                                                                                                                                                                                                                |
| Prompt behavior    | Live generation, Game GM, dry run, live Peek Prompt, and cached Peek Prompt agree for the same accepted state                                                                                                                                                                                                                                                                                     |
| Lore eligibility   | Enabled, disabled, excluded, missing, duplicate, and truncated entries behave consistently                                                                                                                                                                                                                                                                                                        |
| History            | Reload, continuation, regeneration, swipes, branches, deletion, import/export, and checkpoints resolve the expected location                                                                                                                                                                                                                                                                      |
| Travel             | Valid, blocked, hidden, archived, disconnected, stale, waypoint, and idempotent routes have deterministic results                                                                                                                                                                                                                                                                                 |
| Travel modes       | Instant, narrated, stepwise, and goal-only modes produce the documented number of turns and context behavior                                                                                                                                                                                                                                                                                      |
| Compatibility      | Old-map-only, hierarchy-only, combined World/Local, and spatial-disabled Game paths retain one location authority                                                                                                                                                                                                                                                                                 |
| UI                 | Package-owned global Maps page and fallback feature summary, install/update readiness, per-chat activation handoff, bounded full draft preview, pre-apply and post-apply regeneration, first-save summary and return, desktop, mobile, keyboard, screen reader, touch, themes, deep maps, long labels, empty state, error state, interruption, reload, and revision conflict are manually checked |
| Performance        | Prompt size, route-search bounds, large-map rendering, and generation latency are measured against declared limits                                                                                                                                                                                                                                                                                |

Use focused deterministic regression coverage plus the repository checks required
by the files touched. Manual PR checklist items remain unchecked until a human
performs them.
