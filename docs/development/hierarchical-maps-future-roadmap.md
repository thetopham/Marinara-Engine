# Hierarchical Maps: Post-V3 Future Roadmap

Status: Exploratory future TODO; Maps 1.0.6 is published and the Phase 2 implementation plus automated browser closure matrix, first Phase 3 parity slice, and first independently safe creation-preview slice are checkpointed in a package-owned 1.1.0 recovery candidate, still blocked on human release sign-off and the remaining V3 stabilization matrix

Related work:

- [`hierarchical-maps-implementation-plan.md`](./hierarchical-maps-implementation-plan.md) is the canonical documentation map, current-status summary, and delivery-order index.
- [`hierarchical-locations-prd-v3.md`](./hierarchical-locations-prd-v3.md) defines the original architecture and delivery plan.
- [PR #3565](https://github.com/Pasta-Devs/Marinara-Engine/pull/3565) established the first hierarchical-map, spatial-context, and location-lore foundation.
- [PR #3613](https://github.com/Pasta-Devs/Marinara-Engine/pull/3613) moved hierarchical maps into the optional-agent/package system.
- [`hierarchical-maps-addon-recovery-plan.md`](./hierarchical-maps-addon-recovery-plan.md) governs restoration of the extracted package before this future roadmap continues.
- [`hierarchical-maps-creation-ux-notes.md`](./hierarchical-maps-creation-ux-notes.md) records the observed first-map and global feature-page problems behind Workstream 2.
- [`../agents/hierarchical-maps.md`](../agents/hierarchical-maps.md) documents the current user-facing flow and workarounds.
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
snapshot. The `9e1883f` candidate checkpoint now targets capability API `1.2` and
the exact paired Engine checkpoint `20bd419e9`. That Engine slice exposes generic
package logging/debug state, transaction-scoped chat/message and definition-metadata
operations, lore-entry existence reads, the spatial snapshot compatibility store,
normalized route resources, JSON-ish parsing, and secret-free language-model calls;
Maps consumes them for owner turns, state resolution, definition persistence,
snapshot storage, and map drafting without receiving raw providers, credentials,
database handles, or table objects. Exact-artifact proof now also covers runtime
facade readiness, route-level connection resolution, an atomic owner move,
duplicate-command rejection, and missing-lore warnings; Engine rollback proof
covers atomic metadata plus bootstrap snapshot replacement. Package-local REST,
resource hooks, pending-move persistence, and explicit host props/events reduced
the guarded inventory from 52 private imports to zero without moving Maps
validation, routes, prompts, or UI into Engine. The candidate now builds from its
package-owned source tree without copying captured generic Engine dependencies.
The host now also exposes observable client-module loading, error, and retry states
with accessible skeleton and failure surfaces. A Maps-owned package-root boundary
reports runtime failures through the public custom-element event so retry remounts
the feature cleanly. Generic recovery actions and package-owned mobile workspace
actions now keep 44px minimum touch targets.

The first Phase 3 parity slice is also checkpointed in those heads. Live Game and
preset-less Roleplay Peek Prompt now include forced current-location lore and one
authoritative spatial projection. Checkpoints preserve immutable Game and Spatial
Context copies instead of depending only on mutable tracker rows. Exact-artifact
coverage now exercises assistant snapshot creation, continuation, regeneration,
swipes, swipe deletion, earlier-message branching, source-message deletion, JSONL
export/import, and checkpoint restore alongside the existing lifecycle cases.

The candidate also starts the independently safe package-owned portion of
Workstream 2. Draft preview is now a real pre-apply review surface: it exposes the
complete expandable hierarchy, generated count and depth, proposed start, search,
public descriptions, private model memories, and lore provenance. Regenerate, Edit
prompt, Discard draft, and Continue to editor replace the earlier root-only summary
and ambiguous Use this draft decision. Focused exact-artifact creation, expansion,
Game setup review, and skip flows pass on desktop and mobile. Persistence, stable
IDs, committed history, and the Engine contract remain unchanged.

An exact-artifact browser matrix now passes clean install, Maps `1.0.6` update,
restart/readiness, dark/light/SillyTavern desktop and mobile viewports, keyboard and
touch emulation, runtime retry, uninstall, reinstall, and retained campaign state.
Phase 2 implementation and automated closure proof are complete, but its formal
exit still requires unchecked human platform sign-off and Engine-first release
ordering.
The broader recovery exit still requires the normalized all-prompt comparison,
lore-eligibility edge cases, remaining cross-owner history combinations, and
browser/platform proof in the Phase 3 matrix.
No new issue, pull request, screenshots, or recordings were added, and future
travel modes have not started.

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

The first automated slice now covers live current-location lore in Roleplay and
Game Peek Prompt plus representative continuation, regeneration, swipe, branch,
deletion, import/export, and checkpoint restoration. The checks below remain the
full workstream gate; this checkpoint does not mark the workstream complete.

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

Status: In progress. The recursive, searchable pre-apply Draft preview and clearer
decision actions are implemented in the `1.1.0` candidate at `9e1883f`. Direct
activation handoff, the global Maps home, first-map progress, applied-draft
regeneration, starting-location confirmation, first-save completion, and simplified
expansion remain open.

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

## Workstream 5: shareable Game templates and creator starter maps

Creating a complete Game world and then generating or manually authoring its map
can take long enough to discourage retries, alternate campaigns, and community
sharing. Treat reuse as a first-class feature rather than asking every recipient to
repeat both creation flows.

The current Game Setup and Hierarchical Map exports are separate. Add a lightweight
Game Template that combines the reusable initial setup with a clean starting map:

```text
Marinara Game Template
├── template metadata and compatibility
├── initial Game setup and generation instructions
├── optional accepted starting-world overview
├── hierarchical map definition and starting location
└── named references to required characters, lore, presets, and packages
```

### Version 1 template boundary

- Reuse the existing safe Game Setup snapshot and hierarchical-map definition
  formats inside one versioned template envelope rather than inventing duplicate
  schemas.
- Include genre, setting, tone, difficulty, goals, preferences, Game system and
  special instructions, safe generation settings, feature selections, the map
  hierarchy, authored descriptions, private model memory, links, and the intended
  starting location.
- Allow an optional frozen starting-world overview so a creator can share the
  accepted premise that the map was built for. Do not include later campaign
  summaries or mutable play state.
- Preserve internal stable location IDs inside the template. Starting a new Game
  copies the definition so each recipient owns an independent map and runtime.
- Carry human-readable resource labels and compatibility requirements. Remap local
  characters, Personas, lorebooks, entries, prompt presets, connections, and
  installed packages during import, and report every unresolved dependency before
  creation.
- Never include API keys, connection URLs, messages, current campaign location,
  movement snapshots, quests, inventories, trackers, tactical state, swipes,
  checkpoints, or other live campaign history.
- Preview exactly what will be shared. Let the creator remove private model memory
  and non-portable linked-lore references before downloading the template.

### Import and map-generation flow

Import the template from the first step of New Game, populate the normal wizard,
and let the recipient review or change every setting. When the template contains a
hierarchical map, offer:

- `Use included world map` (recommended): skip the normal AI hierarchical-map
  draft, copy the included definition, confirm the starting location, and review it
  before enabling and saving.
- `Generate a new map`: keep the imported Game settings but discard the included
  map and run the normal map-drafting flow.
- `Start without Hierarchical Maps`: keep the setup while leaving the optional
  package inactive.

The included hierarchical map replaces only the optional setup-time hierarchical
draft. Core Game grid and node maps remain local tactical views and may still be
created during play. Never create two competing hierarchical maps silently.

Version 1 may reference matching local Character Cards and lorebooks rather than
embedding their full content. Bundling licensed cards, lorebooks, images, audio, or
other assets belongs to a separately reviewed portable-package format.

Do not overwrite a map that already has committed spatial history. A later
`Add to existing map` workflow may import a subtree with new IDs, but it is not part
of the first Game Template slice.

### Exit gate

A creator can distribute one Game Template containing the intended starting setup
and world map. A recipient can import it, resolve dependencies, choose whether to
use or regenerate the map, and begin a new independent Game without repeating the
long map-authoring flow, damaging an existing campaign, leaking private state, or
silently losing referenced lore.

## Workstream 6: reviewed lore-to-map upkeep

Game Mode's Session Keeper already creates and updates a game-scoped lorebook after
a session concludes. Maps can use selected lorebooks when manually drafting or
expanding a hierarchy, and locations can manually link specific lore entries. The
current systems do not otherwise synchronize: Lorebook Keeper does not create,
move, rename, connect, archive, or update map locations automatically.

Keep the responsibilities explicit:

| System             | Owns                                                                                    | Does not own                                                       |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Lorebook Keeper    | Durable facts about people, places, factions, items, events, history, and world changes | Authoritative topology, travel validity, or current location       |
| Hierarchical Maps  | Location identity, hierarchy, direct links, route state, starting and current place     | General world knowledge unrelated to location structure            |
| Lore-to-map upkeep | Reviewed proposals derived from new or changed lore                                     | Silent canon changes, automatic travel, or deleting historical IDs |

### Initial map from campaign lore

When a Game has Session Keeper lore but no hierarchy, offer `Draft map from campaign
lore`. This preselects the game-scoped lorebook and uses the existing lore-grounded
AI builder. The complete draft still requires normal preview, starting-location
confirmation, enablement, and save; lore entries never become map canon merely
because Session Keeper wrote them.

### Ongoing map-upkeep suggestions

After Session Keeper adds or changes entries, Maps may prepare a reviewed batch of
spatial suggestions:

- match a new place entry to an existing location and attach the lore reference;
- propose a new location beneath a suggested parent;
- propose updates to public description or private model memory;
- propose a direct link or a change between available and blocked route state; or
- report an ambiguous, conflicting, archived, or unresolved place without changing
  anything.

Examples:

- `The party discovered Ashfall Village` may propose a new settlement and attach
  the village lore entry.
- `The western bridge collapsed` may propose blocking the matching direct route.
- `The king died` remains a lore update and produces no map change.
- `The party arrived at the castle` may produce a travel suggestion under
  Workstream 7, but it does not create a new castle or move the party by itself.

Present one review surface after the Session Keeper result:

```text
Map upkeep found 3 possible changes

[Link lore to Ashfall Village]  [Review]
[Add Sunken Chapel under Old Marsh]  [Review]
[Block Western Bridge route]  [Review]

[Apply selected] [Dismiss]
```

Offer per-chat behavior:

- `Off`: Lorebook Keeper and Maps remain independent.
- `Suggest map changes` (default): prepare a review batch without mutating the map.
- `Auto-link exact matches`: automatically attach a new lore entry only when its
  stable reference or unique normalized name matches one existing active location;
  all structural changes still require review.

### Validation and history rules

- Never create a second location solely because a lore entry uses another spelling
  for an existing place. Show ambiguous matches and let the user choose.
- Never delete or replace a stable location ID. Accepted additions receive new IDs;
  reparenting, archiving, and link-state changes require explicit review.
- Never change the current location, starting location, or pending destination as a
  side effect of lore synchronization.
- Validate the complete accepted batch against the expected definition revision and
  apply it atomically as one inspectable map revision. A stale batch becomes
  `Needs review` and applies nothing.
- Respect disabled books, entries, folders, chat exclusions, protected Lorebook
  Keeper entries, and Maps limits. Removing or disabling lore does not delete a
  location automatically.
- Avoid a second inference model by default. Prefer structured spatial hints from
  the existing Session Keeper result or deterministic matching; require an explicit
  product decision before adding another model call for map upkeep.
- Keep Maps package-owned. Engine may expose only generic lore-change events,
  resource lookup, transactions, and review-host contracts needed by multiple
  packages.

### Exit gate

A campaign can draft its first hierarchy from Session Keeper lore and later review
useful lore-derived map additions, links, and route-state changes without duplicate
places, silent movement, broken history, or automatic promotion of every lore fact
into map canon.

## Workstream 7: constrained model-suggested movement

Consider this only after manual travel is dependable and its destination and route
validation APIs are stable. The goal is to remove map-administration friction from
creative writing without letting generated prose silently mutate authoritative
location state.

### Suggest and stage experience

When the user writes naturally about travel, the existing generation model may
emit a typed destination suggestion using a stable location ID. Marinara validates
the request against the current location, definition revision, active graph, and
available route before showing it.

```text
Suggested destination: Castle
Route: Tideglass Inn -> Harbor District -> Brinewatch -> Castle

[Accept] [Choose another] [Dismiss]
```

- `Accept` stages the validated destination or route through the same typed travel
  contract as manual map selection. It must not require reopening the map.
- `Choose another` opens the destination picker without discarding the message
  draft or generated reply.
- `Dismiss` removes the suggestion without changing location or chat history.
- An adjacent suggestion can initially reuse the existing one-hop pending spatial
  transition. Distant suggestions depend on the Workstream 3 travel-plan contract.
- Until the durable zero-turn travel history anchor exists, an accepted suggestion
  follows the current commit-with-next-owner-turn rule. After that anchor exists,
  an explicit `Accept and move` action may commit without requiring another story
  message.

Offer per-chat assistance settings:

- `Off`: never request or display model travel suggestions.
- `Suggest` (default): display a validated suggestion and require approval.
- `Auto-stage explicit travel`: stage an unambiguous, valid request immediately,
  but keep it visible and cancelable; never commit it silently.

### Authority and safety rules

- Expose a typed destination request using stable location IDs. Do not treat the
  model saying that someone arrived as proof that movement occurred.
- Keep destination requests out of visible prose and out of free-form location-name
  parsing. Do not add a separate action-inference LLM merely to select movement.
- Let the existing server destination, route, revision, and idempotency validators
  decide whether a suggestion is possible.
- Show ambiguity or failure clearly, including same-name matches, blocked routes,
  archived locations, stale revisions, and disconnected destinations.
- A suggestion becomes `Needs review` when the current location or map revision
  changes. Never silently substitute another route or destination.
- AI-written arrivals, unbound Game-map markers, and ordinary tactical movement do
  not change the hierarchy on their own. A bound Game position may stage the same
  validated transition through the existing binding contract.
- Only one destination or travel plan may be staged at a time. Accepting a new one
  visibly replaces or rejects the older draft.
- Record accepted and rejected typed requests in debug diagnostics without adding
  hidden user dialogue.

### Current implementation boundary

Maps 1.1.5 implements manual one-hop `Set destination`, validated pending spatial
transitions, visible queued and `Needs review` states, and bound Game-position
staging. It does not implement model suggestions, natural-writing travel staging,
multi-hop route plans, `Travel now`, or `Accept and move`. Those remain future work,
and distant suggestions depend on Workstream 3 rather than bypassing it.

### Exit gate

The user can write travel naturally, receive or automatically stage a visible and
valid destination suggestion, approve or dismiss it without reopening Maps, and
retain deterministic route rules, spatial history, and prompt budgets. Generated
prose alone never changes the authoritative location.

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
- Full portable campaign packages that merge live history, lorebooks, Character
  Cards, and media assets. The lightweight setup-plus-map Game Template is covered
  by Workstream 5.
- Automatic promotion of generated content into map canon.

## Suggested delivery order

The order below is a planning sequence, not a single implementation project. The
Engine manifest prerequisite landed in PR #3652, while item 1 remains active on the
existing Maps feature branch; issue #16 stays closed. Merged PR #35 advances part
of items 2 and 5 but does not complete either exit gate:

1. Finish the package-owned source migration and exact-artifact compatibility
   proof in Marinara Agents, with only generic paired host support in Engine.
2. Stabilize and revalidate the extracted V3 foundation.
3. Simplify global feature-agent presentation, package-to-chat activation,
   first-map creation, recursive draft review, rejection/regeneration,
   starting-location confirmation, and first save.
4. Add the lightweight shareable Game Template using the stable Game Setup and
   hierarchical-map import/export formats, with included-map review and explicit
   duplicate-generation handling.
5. Build the shared Roleplay/Game runtime world-map surface.
6. Add reviewed lore-to-map upkeep: first-map drafting from Session Keeper lore,
   exact-match linking, and atomic review batches for structural suggestions.
7. Implement destination preview and `Travel now` with an explicit history
   anchor.
8. Add `Narrate journey`, `Explore each stop`, waypoints, and `Set as goal` as
   independently reviewable slices.
9. Run the old-map/lorebook/hierarchical-map comparison and decide whether the
   feature has earned more investment.
10. Consider constrained model-suggested movement with `Suggest` and
    `Auto-stage explicit travel` assistance modes.
11. Re-evaluate each postponed V3 package separately.

Do not begin all numbered items under one issue or pull request.

## Open questions register

Before dependent implementation, convert the relevant questions into decisions on
the tracking issue. Canonical source ownership is already resolved in favor of
Marinara Agents:

- What remains readable when the optional package is absent?
- Is the first Game Template a plain JSON envelope or a ZIP even though version 1
  intentionally contains no bundled media?
- Is the accepted starting-world overview included by default, offered as an
  explicit share option, or regenerated from the imported settings?
- How are location-linked lore entry IDs represented and remapped when the
  recipient has the lore under different local IDs?
- Should an included map remain disabled until its dependency review passes, or
  may the recipient explicitly approve and enable it in the New Game wizard?
- Should Game Session Keeper emit typed spatial hints in its existing response, or
  should Maps derive proposals from a generic lore-change event?
- Which exact-match evidence is strong enough for `Auto-link exact matches`, and
  how are aliases distinguished from genuinely different places?
- How long are dismissed map-upkeep suggestions suppressed when Lorebook Keeper
  updates the same entry again?
- What is the durable history anchor for zero-turn travel?
- Is the route API a single destination request or an explicit client-proposed
  route checked by the server?
- How are waypoints represented and validated?
- Which route facts are sufficient for one narrated journey?
- What are the prompt and lore budgets for that narration?
- Does fast travel require creator-authored restrictions beyond graph reachability?
- Should adjacent `Go here` default to instant movement or preserve the current
  send-with-next-turn behavior?
- Can a typed model suggestion be validated early enough for destination context
  to affect the same generated reply, or must it reconcile after the reply?
- Does `Accept and move` attach its spatial snapshot to the generated assistant
  message or create the same explicit history event as `Travel now`?
- Are dismissed and unaccepted suggestions ephemeral, or must regeneration,
  swipes, reload, and branches reproduce them?
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
| Game templates     | Setup-only, setup-plus-map, missing package, missing Character Card, missing lore, remapped local IDs, stripped private memory, included-map, regenerate-map, and no-map imports produce one reviewed starting configuration without secrets, history, or duplicate maps                                                                                                                          |
| Lore-to-map upkeep | First-map draft, exact match, alias, duplicate name, new place, description update, route-state suggestion, irrelevant fact, disabled lore, stale revision, dismissed proposal, atomic apply, and failed apply preserve lore and map authority without silent movement or partial mutation                                                                                                        |
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
