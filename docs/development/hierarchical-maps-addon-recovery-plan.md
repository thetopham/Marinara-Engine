# Hierarchical Maps Add-on Recovery and Continuation Plan

Status: Active implementation; Maps 1.0.6 is published, the Phase 2 implementation and automated browser closure matrix plus the first Phase 3 parity slice are checkpointed in a package-owned 1.1.0 recovery candidate, human release sign-off and the remaining V3 proof matrix stay open, and new travel features remain blocked

Audience: Marinara Engine and Marinara Agents maintainers

Implementation repositories:

- [Pasta-Devs/Marinara-Engine](https://github.com/Pasta-Devs/Marinara-Engine)
- [Pasta-Devs/Marinara-Agents](https://github.com/Pasta-Devs/Marinara-Agents)

Planning inputs:

- [`hierarchical-maps-implementation-plan.md`](./hierarchical-maps-implementation-plan.md)
- [`hierarchical-locations-prd-v3.md`](./hierarchical-locations-prd-v3.md)
- [`hierarchical-maps-future-roadmap.md`](./hierarchical-maps-future-roadmap.md)
- [`hierarchical-maps-creation-ux-notes.md`](./hierarchical-maps-creation-ux-notes.md)
- [`optional-agent-packages.md`](./optional-agent-packages.md)

## Purpose

Restore Hierarchical Maps as a dependable downloadable capability package, preserve
existing map data and history, and establish a package boundary that can survive
future Engine changes. Once the restored V3 foundation passes its proof gates,
continue toward a simpler runtime world map and player-controlled travel.

This plan replaces neither the V3 product definition nor the exploratory future
roadmap. It converts their accepted requirements into cross-repository delivery
work after the optional-package extraction.

## Implementation status — July 15, 2026

- Incident containment and generic readiness diagnostics landed in
  [Marinara Engine PR #3644](https://github.com/Pasta-Devs/Marinara-Engine/pull/3644).
- Hierarchical Maps `1.0.1` and its immutable catalog artifact landed in
  [Marinara Agents PR #15](https://github.com/Pasta-Devs/Marinara-Agents/pull/15).
- Engine catalog version direction and downgrade refusal landed in
  [PR #3649](https://github.com/Pasta-Devs/Marinara-Engine/pull/3649).
- The Phase 2 manifest-version prerequisite landed through
  [Engine issue #3651](https://github.com/Pasta-Devs/Marinara-Engine/issues/3651)
  and
  [PR #3652](https://github.com/Pasta-Devs/Marinara-Engine/pull/3652).
- [Marinara Agents issue #16](https://github.com/Pasta-Devs/Marinara-Agents/issues/16)
  is closed and was not reopened. Follow-up implementation remains on the existing
  `feature/hierarchical-maps-package-source-16` branch.
- Phase 3 UI, Game-map reconciliation, and owner-turn authority recovery is tracked
  by [Marinara Agents issue #34](https://github.com/Pasta-Devs/Marinara-Agents/issues/34)
  and [PR #35](https://github.com/Pasta-Devs/Marinara-Agents/pull/35). The PR merged
  to `staging` as `533560a` with the Maps `1.0.6` package head at `ea062de`.
- The pushed `feature/hierarchical-maps-package-source-16` checkpoint at `dad64e1`
  moves all Maps-owned server and client implementation files under
  `packages/hierarchical-maps/src/`. The feature builder overlays those files on
  captured generic Engine dependencies and rejects any move back into the generic
  snapshot. Rebuilding Maps `1.0.6` from the new source location produced the same
  server bundle, client bundle, manifest, and ZIP hashes.
- The pushed checkpoint at `1948183` builds a Maps `1.1.0` candidate with a
  non-destructive existing-Game reconciliation flow. It previews exact normalized
  name matches, reports unmatched and ambiguous positions, requires explicit review,
  preserves existing bindings, applies accepted matches atomically, and makes an
  identical retry a no-op. No new issue or pull request was opened.
- The exact-artifact lifecycle regression now updates through Maps `1.0.6` to the
  `1.1.0` candidate and covers rejected partial reconciliation, reviewed apply,
  retry, atomic owner-turn persistence, duplicate-command rejection, offline
  restart, remove, reinstall, full-backup creation, and full-backup restore.
- The generic Engine checkpoint at `20bd419e9` exposes capability API `1.2`
  package logging, effective agent-debug state, transaction-scoped chat/message and
  definition-metadata operations, lore-entry existence reads, the spatial snapshot
  compatibility store, normalized route resources, JSON-ish parsing, and
  secret-free language-model resolution and calls. It does not expose the
  underlying logger, runtime configuration, provider implementation, credential,
  database handle, or table objects. It remains isolated on
  `feature/capability-runtime-logging` in the `thetopham` fork, bridges generic
  host-owned UI state through contribution props/events, exposes observable client
  loading/error/retry states with accessible fallbacks and 44px recovery actions,
  and must land before the dependent Maps candidate is published.
- The Maps `1.1.0` candidate checkpoint at `9e1883f` targets that exact
  Engine commit and consumes the runtime facade for owner-turn commits, state
  resolution, definition metadata, lore-link warnings, snapshot storage, route
  resources, JSON parsing, and model calls. Package-local REST, resource hooks,
  pending-move persistence, and host contribution props/events removed the final
  client dependencies. The boundary contract now asserts zero private Engine
  imports during both build and catalog validation, down from the original 52,
  and Maps builds without copying captured generic Engine sources. Its package-root
  client error boundary reports runtime failures to the generic host for a clean
  retry, while the package-owned mobile workspace keeps 44px editor actions. Maps
  validation, routes, prompts, and UI remain package-owned.

PR #35 restores and proves these recovery slices:

- full-screen authoring and a shared Roleplay/Game runtime map on desktop and mobile;
- Game `World` hierarchy precedence over an optional bound `Local` tactical map;
- reviewed Game setup bindings across `gameMap`, `activeGameMapId`, and the selected
  `gameMaps` entry;
- generated-turn authority: prose, bracketed commands, local party markers, and
  `[map_update]` cannot move the hierarchical world location;
- owner-selected Roleplay movement committed with the owner turn, including package
  state reconciliation after accepted and stale turns;
- focused generated-turn, setup, prompt-scope, cleanup, and desktop/mobile runtime
  regression coverage.

The first Phase 3 parity checkpoint adds two generic Engine corrections and exact
artifact proof. Live Game and preset-less Roleplay Peek Prompt assembly now runs
the same location-lore eligibility path and injects the authoritative spatial
projection instead of falling through to incomplete raw history. Game checkpoints
now retain immutable copies of their Game and Spatial Context snapshots, while
older ID-only checkpoints remain loadable. The exact `1.1.0` lifecycle regression
now covers live prompt location lore, assistant snapshot creation, continuation,
regeneration and swipes, swipe deletion, earlier-message branching, source-message
deletion, JSONL export/import, and checkpoint restore in addition to the existing
package lifecycle and reconciliation cases.

The recovery candidate completes the implementation portion of Phase 2, but not
its human publication sign-off or the full Phase 3 proof matrix.
Package-owned source, automated
existing-campaign reconciliation, generic package logging, owner-turn/state
persistence, atomic definition-metadata plus snapshot persistence, both server and
client boundaries, the source-only build, and generic client loading/error/retry
presentation are now implemented. A focused host regression proves a failed module
load, retry, simulated package runtime failure, remount, and touch-sized recovery
actions. An exact-artifact browser matrix now passes clean install, Maps `1.0.6`
update, restart/readiness, dark/light/SillyTavern desktop and mobile viewports,
keyboard and touch emulation, runtime retry, uninstall, reinstall, and retained
campaign state. The first history and live-prompt parity slice is now automated,
while the normalized all-prompt, lore-eligibility, cross-owner-mode, and remaining
browser proof still belong to Phase 3.
The automated lifecycle and browser checkpoints do not replace the remaining
unchecked human browser and platform checks.

## Historical incident and current containment

The main Agents catalog now publishes Maps `1.0.6`, so the broken `1.0.0`
behavior described below is no longer the user-facing catalog version. The
underlying boundary lesson still governs the remaining recovery work.

Hierarchical Maps `1.0.0` activates but fails when it reads spatial snapshots. The
published bundle was built from a captured Engine source tree that still defines
Drizzle SQLite table objects. Current Marinara Engine uses file-native table
metadata. The package passes installation and activation checks, then fails on the
first real storage operation.

This incident exposes four boundary failures:

1. The package bundles private Engine implementation paths from a frozen source
   snapshot.
2. The manifest declares a broad Engine version range without a capability API or
   storage ABI version.
3. Activation proves registration, not functional readiness.
4. Engine and package tests do not install and exercise the published artifact
   together.

Existing definitions and snapshots must be treated as user data at risk. Recovery
must not uninstall the package, delete package data, reset chat metadata, or rewrite
history merely to make the UI load.

## Product scope

### Restoration baseline

The first complete restored release includes the V3 functionality delivered before
the extraction:

- shared schemas, graph validation, bounded limits, and stable opaque location IDs;
- definition editing with revision conflicts, archive rules, duplicate subtree,
  positioned maps, layers, and accessible list navigation;
- message and swipe anchored spatial snapshots;
- reload, continuation, regeneration, branch, deletion, import, export, and Game
  checkpoint behavior;
- one authoritative Roleplay or Game location;
- atomic owner movement with the next turn;
- bounded prompt projection across live generation, Game GM, dry run, retry,
  continuation, live Peek Prompt, and cached Peek Prompt;
- explicit Game tactical map, cell, and node bindings;
- AI map creation, history-safe expansion, and the Game setup draft flow;
- location lore bindings, eligibility enforcement, Active Context reporting, and
  lorebook-grounded drafting with visible provenance;
- desktop, mobile, keyboard, touch, dark, light, and SillyTavern theme support.

### Continuation scope after recovery

After the restoration gate passes, implement these improvements in order:

1. A shared Roleplay and Game runtime world-map surface that makes current location,
   destinations, and actions obvious without exposing authoring concepts.
2. Destination preview with an authoritative route and explicit stale-state review.
3. `Travel now` with a durable zero-model-turn history event.
4. `Narrate journey`, `Explore each stop`, user-selected waypoints, and `Set as goal`
   as separate reviewable slices.
5. Measured comparison against old-map-only and ordinary-lorebook configurations.
6. Creator starter maps only if the runtime and evaluation gates succeed.

### Deferred

Do not include these in the recovery release:

- generic flags, scripts, events, timers, or a scenario engine;
- independent positions or fog of war for every character;
- model-selected scenic routes without authored route metadata;
- unattended multi-turn travel;
- automatic promotion of generated text or art into canon;
- image-to-map inference or 3D rendering;
- Connected Conversation projection;
- V3 visual identity and Storyboard reference packages F.3 and F.3.1;
- model-requested movement.

Visual identity, Storyboard references, and Connected Conversation each require a
new value and size review after the owner runtime proves dependable.

## Architecture decisions

### 1. Canonical ownership

Marinara Agents owns the executable Hierarchical Maps implementation and every
published artifact. Marinara Engine owns only stable contracts, inert integration
points, lifecycle state, generic or compatibility persistence, and fallback behavior.

Generated `server.mjs`, `client.js`, manifests, archives, and catalog entries are
artifacts. They are never the editable source of truth.

### 2. Package source layout

Move the editable implementation into a package-owned tree in Marinara Agents:

```text
packages/hierarchical-maps/
  src/
    shared/
    server/
      routes/
      services/
      storage/
    client/
      components/
      hooks/
      api/
      entry.tsx
  tests/
    regressions/
    e2e/
  agents.json
  manifest.template.json
```

The builder compiles only this package source plus public capability contracts. It
must not select `sources/engine` as an implementation fallback. The existing
captured tree may remain temporarily for reproducing old artifacts, but no production
build may import from it.

### 3. Capability API version

Add a required capability contract to executable package manifests:

```json
{
  "capabilityApi": {
    "major": 1,
    "minor": 0
  },
  "builtAgainst": {
    "engineVersion": "2.3.0",
    "engineCommit": "<full commit>"
  }
}
```

Rules:

- Engine rejects an unsupported capability API major before extracting or loading
  the package.
- A higher supported minor remains backward compatible within the same major.
- `builtAgainst` is diagnostic provenance, not a replacement for the compatibility
  range.
- The emergency package narrows its Engine range to the tested minor series.
- Expanding the range requires the cross-repository compatibility suite to pass.

### 4. Storage boundary

Package code must not receive the raw Engine database or define copies of Engine
tables. Engine retains registration and compatibility access for spatial snapshot
records so historical chats remain safe when the package is unavailable.

Capability API v1 exposes typed host operations for:

- reading and updating chat metadata with expected revision checks;
- reading visible message and swipe anchors;
- reading, creating, replacing, and listing spatial snapshots;
- committing one owner message and one validated spatial snapshot atomically;
- copying effective spatial state for branches and imports;
- resolving and restoring the spatial snapshot associated with Game checkpoints;
- listing eligible lorebook entries by stable ID;
- resolving configured model connections through the normal Engine provider path;
- emitting prompt debug output through the shared Pino logger.

The package owns spatial validation and domain decisions. Engine owns transaction
integrity and file-storage compatibility. No package method may accept `DB`, a table
object, a private storage service, or a private Engine source import.

### 5. Integration boundary

Engine retains narrow typed bridge points for behavior that participates in core
generation and history:

- owner spatial projection;
- spatial state resolution and materialization;
- owner-turn transition validation and commit request;
- Game map binding;
- location-lore forced candidate resolution;
- optional visual slots rendered by the client host.

When the package is absent, read bridges return inert values, write bridges return a
typed `spatial_feature_unavailable` result, and historical data remains untouched.

### 6. Client boundary

The package owns the map editor, runtime location controls, AI drafting review, Game
world-map view, and all map-specific client state. Engine owns the custom-element
host, capability status query, error boundary, and fallback surface.

Every contribution renders one of these host states before package UI appears:

- loading;
- restart required;
- incompatible;
- runtime activation failed;
- client module failed to load;
- ready;
- package missing while the chat retains spatial data.

The fallback always offers a useful next action such as restart, retry, update,
download, or return to chat. It never leaves an empty custom element on screen.

### 7. Readiness and rollback

Server activation is a two-step state:

1. `registered`: entrypoint imported and contributions registered;
2. `ready`: package self-check proves contract version, snapshot read access, route
   registration, and cleanup behavior.

Only `ready` packages appear in agent registries or mode capability lists. A
restart-required package remains unavailable until the restarted runtime reaches
`ready`. A failed update rolls back to the previous ready artifact without deleting
data.

## Repository ownership matrix

| Concern                          | Marinara Engine                | Marinara Agents                              |
| -------------------------------- | ------------------------------ | -------------------------------------------- |
| Manifest and catalog schemas     | Owns supported contract        | Produces conforming entries                  |
| Capability API                   | Owns versioned host interfaces | Consumes public interfaces                   |
| Package lifecycle and rollback   | Owns                           | Supplies self-check and cleanup              |
| Snapshot table compatibility     | Owns                           | Uses typed snapshot operations               |
| Atomic chat and snapshot commit  | Owns transaction               | Supplies validated transition intent         |
| Shared spatial wire schemas      | Owns stable public contract    | Uses and tests contract                      |
| Map validation and route logic   | Exposes inert bridge           | Owns implementation                          |
| Prompt formatting and projection | Calls bridge                   | Owns implementation                          |
| Location lore selection intent   | Supplies eligible records      | Owns spatial selection rules                 |
| Map routes                       | Hosts registered routes        | Owns handlers and validation                 |
| Map editor and runtime UI        | Hosts contribution element     | Owns UI                                      |
| Cross-repository fixture runner  | Owns Engine harness            | Owns artifact fixtures and E2E suite         |
| Package source and artifacts     | None                           | Owns source, build, hashes, archive, catalog |

## Delivery plan

Each phase has its own issue, visible owner, draft pull request, success criteria,
and proof. Engine changes target `staging`. Marinara Agents changes also target its
development branch according to that repository's contributor workflow.

Cross-repository delivery is mandatory when a package change depends on Engine
support:

- every Hierarchical Maps source fix, behavior change, version bump, manifest,
  generated bundle, ZIP, and catalog entry is changed and reviewed only in
  Marinara Agents;
- Marinara Engine receives only generic host contracts, inert integration points,
  compatibility persistence, lifecycle behavior, and fallback UI;
- keep paired Engine and Agents pull requests in draft until the exact generated
  artifact passes against the paired Engine branch;
- land required Engine support before landing or publishing the Agents catalog
  update;
- never advertise a package version whose required Engine support has not landed.

### Phase 0: incident containment and fixtures

Status: Contained by Engine PR #3644 and Marinara Agents PR #15; retain the fixtures
for later compatibility-suite coverage.

Goal: preserve evidence and user data before changing runtime behavior.

Engine work:

- add a deterministic fixture containing an existing map definition and bootstrap,
  message, and swipe snapshots;
- add a black-box assertion that Hierarchical Maps `1.0.0` fails against the current
  file-native adapter for the known reason;
- expose installed package version and readiness in diagnostics without dumping map
  data;
- keep the package files and stored snapshots intact.

Agents work:

- archive the exact `1.0.0` manifest, hashes, and source provenance as a regression
  fixture;
- mark `1.0.0` superseded once a compatible update is available;
- prevent catalog metadata from advertising an untested broader compatibility range.

Exit gate:

- the failure is reproducible without using a real user chat;
- a backup and restore round trip proves definitions and snapshots are unchanged;
- no recovery step requires uninstalling the package.

### Phase 1: emergency compatibility release 1.0.1

Status: Shipped through Marinara Agents PR #15 with paired Engine readiness support
from PR #3644. Remaining full V3 manual proof belongs to Phase 3 stabilization.

Goal: restore existing behavior quickly while the durable host API is built.

Agents work:

- port the package snapshot table definition to the current file-table contract;
- rebuild `server.mjs` and `client.js` from audited source;
- narrow Engine compatibility to the tested 2.3 minor series;
- add activation self-check coverage for one empty map read, one existing snapshot
  read, one definition write, and cleanup;
- bump the package and catalog entry to `1.0.1` with new immutable hashes.

Engine work:

- reject readiness when the package cannot read the spatial snapshot table;
- keep the previous artifact available for rollback, but never automatically roll
  back from a working `1.0.1` to broken `1.0.0`;
- expose a clear update-required state for `1.0.0`.

Exit gate:

- install, restart, GET, PUT, owner movement, and one generation path pass against
  a clean test profile and an upgraded fixture;
- live health distinguishes Engine health from package readiness;
- the real package route no longer returns 500.

This is a recovery release, not the final architecture. No continuation feature may
merge on top of the compatibility shim.

### Phase 2: capability API v1 and package-owned source release 1.1.0

Status: Manifest v2 and API-version compatibility landed through Engine issue
#3651 and PR #3652. The `1.1.0` candidate now uses that manifest contract, records
its Engine build provenance, and enforces a zero-private-import boundary.
Capability API `1.2` logging/debug, transactional owner-turn
and definition-metadata writes, lore-entry existence reads, compatibility snapshot
operations, route resources, JSON parsing, and model calls are checkpointed at
Engine `20bd419e9` and Agents `9e1883f`. Package-owned source, the server and client
boundaries, the source-only build, generic client loading/error/retry presentation,
and touch-sized recovery/workspace actions are established. An exact-artifact
browser matrix passes clean and upgraded-profile Download Agents lifecycle checks,
restart/readiness, desktop/mobile viewports, all three built-in theme combinations,
keyboard/touch emulation, runtime retry, and reinstall preservation. The
implementation and automated closure proof are complete; unchecked human platform
sign-off plus Engine-first release ordering remain before formal Phase 2 closure.
Issue #16 remains closed and must not be reopened.

Goal: remove the frozen private-source dependency.

Engine work:

- add manifest parsing and compatibility checks for `capabilityApi` and
  `builtAgainst`;
- keep the implemented typed route-level lorebook, character, connection, parsing,
  and provider host operations narrow and inert; logging/debug, owner-turn and
  definition transactions, lore existence checks, and snapshot compatibility
  persistence are also checkpointed;
- replace raw database arguments in spatial bridge interfaces with public DTOs and
  host operations;
- expose registered and ready lifecycle states;
- add client capability load state and an error boundary.

Agents work:

- establish `packages/hierarchical-maps/src` as canonical source;
- move definition, drafting, projection, state resolution, movement, Game binding,
  storage orchestration, and UI code from the captured Engine tree;
- replace private Engine imports with capability API v1 calls and public shared
  schemas;
- delete the Hierarchical Maps fallback to `sources/engine` from the builder;
- generate artifacts from package-owned source only;
- publish `1.1.0` after the exact artifact passes the compatibility suite.

Exit gate:

- a build fails if any Hierarchical Maps source imports an Engine private path;
- the package contains no copied Engine table objects or raw database access;
- removing the package hides behavior but leaves definitions and snapshots intact;
- reinstalling the same version restores behavior without data conversion.

### Phase 3: restore the complete V3 owner foundation

Goal: prove that extraction preserved all delivered V3 behavior.

Status: In progress at Engine `20bd419e9` and Agents `9e1883f`. The exact candidate
now proves live Roleplay/Game Peek Prompt location lore, representative
continuation, regeneration, swipe, branch, deletion, JSONL import/export, and
immutable Game/Spatial checkpoint behavior. This is a checkpoint, not Phase 3
closure: retry combinations, both-owner-mode coverage, the normalized normal/Game
GM/dry-run/live Peek/cached Peek comparison, lore eligibility edge cases, and
remaining browser/platform proof are still open.

An independently safe package-owned creation slice is also checkpointed at that
Agents head. Generated Draft preview now exposes the complete browsable hierarchy,
count, depth, proposed start, location descriptions, private model memories, lore
provenance, search, and explicit regenerate/edit/discard/continue decisions before
the draft enters the working editor. This does not close Phase 3 or change the
Engine boundary, save semantics, stable IDs, or committed history.

#### P0 release blocker: reconcile Game setup maps

Status: New-setup behavior shipped in Maps `1.0.6`; existing-campaign
reconciliation is implemented and validated in the Maps `1.1.0` candidate at
`1948183`. New Game setup maps are reviewed and bound to the hierarchy, prompt
authority is explicit, generated `[map_update]` output remains local, and active
existing campaigns now require an explicit exact-match review before any binding
write. The remaining release-blocking browser, history, prompt, and platform proof
still blocks Phase 3 completion and continuation travel work.

Current Game setup creates two independent spatial models:

1. `/game/setup` asks the GM setup model for `startingMap`, converts it to the
   legacy chat `gameMap`, and saves it.
2. After setup succeeds, the Hierarchical Maps draft route makes a separate model
   request from setup prose, characters, story context, and optional lore. It does
   not receive the generated `startingMap` or saved `gameMap` as source material.
3. Generation then sends both models to the GM. The legacy map appears as
   `<map_state>`, while the separately drafted hierarchy appears as
   `<spatial_context authority="application">` and declares itself authoritative.

The live reproduction produced a local map named `The Crownscar` with Embercross,
Starwood, Rune Chapel, Iron Vein, Sky Anvil, and Architect's Shrine. Its hierarchy
instead selected `Kingdom of Veyr > Crownward Rise > Waywake Village > Architect's
Shrine > Waking Vault`; none of the local map or node records had a
`spatialLocationId`. Both incompatible descriptions were present in the same Peek
Prompt. This is not merely an editor presentation problem: the model receives two
location vocabularies, local map updates can mutate only the legacy model, and
unbound movement can disagree with the canonical spatial snapshot.

Required product contract:

- When Hierarchical Maps is enabled for Game, the hierarchy is the only
  authoritative world and story-location model.
- The existing Game `gameMap` remains useful as an optional local or tactical map
  nested under a bound hierarchical location. It must not act as a second world
  map.
- When Hierarchical Maps is disabled or unavailable, legacy `gameMap` generation,
  prompting, movement, and updates remain unchanged.
- Existing local maps are user data. Reconciliation must preserve them and must
  not silently replace, merge, delete, or reinterpret their locations.

Implementation work:

1. Unify Game setup input. Pass the normalized `startingMap` or saved `gameMap` to
   the hierarchy draft operation, and require the reviewed result to preserve or
   explicitly place those locations instead of independently inventing a second
   geography.
2. Create durable bindings during the reviewed setup commit. Bind the local map to
   its containing hierarchical location and bind imported nodes or cells to their
   corresponding stable location IDs where they represent world locations.
3. Unify prompt semantics. Keep `<spatial_context>` authoritative and label legacy
   detail as local or tactical context under the current hierarchy location. Never
   present two independent `Current` locations or imply that both maps own world
   movement.
4. Gate map mutations. While hierarchical ownership is active, do not let
   `[map_update]` create or move world truth only in legacy `gameMap`. Route world
   changes through hierarchical authoring and history-safe review; permit local
   tactical updates only when they remain scoped to a bound local map.
5. Unify movement. Hierarchical transitions change canonical story location.
   Local movement changes position inside the bound location. Selecting a local
   node bound to another hierarchical location stages the normal validated spatial
   transition; an unbound node must remain explicitly local or require binding
   rather than silently changing world location.
6. Add a non-destructive reconciliation flow for existing campaigns. Suggest
   exact normalized-name matches, show unmatched and conflicting locations, and
   require review before writing bindings. Preserve the original maps and spatial
   snapshots so the operation can be cancelled or safely retried.

   Implemented in the Maps `1.1.0` candidate. The server revalidates every reviewed
   match against the current definition and Game maps before one metadata write,
   rejects the whole request if any selection is stale, preserves pre-existing
   bindings, and treats an identical retry as success with zero new writes.

Release-blocking proof:

- A Game setup with both Draft with AI and Hierarchical Maps enabled produces one
  reviewed world hierarchy that contains or explicitly binds every accepted
  starting-map location.
- Normal generation, retry, continuation, swipe, dry run, live Peek Prompt, and
  cached Peek Prompt expose one authoritative world location and clearly scoped
  local detail.
- No world-level generated map update can mutate legacy `gameMap` independently
  while hierarchical ownership is active.
- Bound and unbound node or cell movement behave according to the contract on
  desktop and mobile, across reload and Game checkpoint restore.
- Enabling Hierarchical Maps in an existing Game offers reviewable reconciliation
  with no map, binding, snapshot, message, or swipe data loss.
- Games without an enabled or ready Hierarchical Maps package retain current
  legacy-map behavior.

Implement and verify these vertical slices:

1. Schema, graph validation, limits, archive, and duplicate subtree.
2. Definition persistence and optimistic revision handling.
3. Snapshot resolution for bootstrap, messages, swipes, regeneration, continuation,
   branches, deletion, imports, exports, and checkpoints.
4. Atomic movement with owner turns and idempotent command IDs.
5. Shared prompt projection and Game single-location authority.
6. Desktop and mobile authoring workspace with positioned, layered, and list views.
7. AI create, pre-history replace, history-safe expansion, and Game setup drafting.
8. Game tactical map, cell, and node bindings.
9. Location lore bindings, eligibility, Active Context, and prompt parity.
10. Lorebook-grounded drafting with Strict canon and Canon with expansion provenance.

Exit gate:

- every row in the V3 proof matrix applicable to packages A through F.2 passes;
- all Engine prompt paths agree for one accepted spatial state;
- a real browser completes create, edit, save, move, reload, conflict, and recovery on
  desktop and mobile;
- no original V3 acceptance criterion is silently removed. Any intentional change
  receives an explicit product decision in the tracking issue.

### Phase 4: runtime world-map simplification

Goal: make ordinary play simpler than authoring.

Status: The Maps `1.0.6` candidate restores the shared Roleplay/Game runtime surface,
Game `World` / `Local` precedence, destination staging, and stale-turn review on
desktop and mobile. Treat this as a recovered baseline, not Phase 4 completion;
ordinary-player clarity, accessibility, themes, long/deep map states, and all exit
gate checks still require review.

Package UI work:

- show the current breadcrumb and location prominently in Roleplay and Game;
- let users inspect a location without entering creator mode;
- distinguish `Inspect`, `Go here`, `Set destination`, and `Explore inside`;
- show reachable destinations without graph terminology;
- share the world-map component and movement semantics between Roleplay and Game;
- retain the Game `World` and `Local` switch;
- keep editor, AI drafting, provenance, archive, and repair controls in creator mode;
- preserve a complete accessible list alternative to map and layer views.

UX states:

- loading uses a stable skeleton rather than a centered spinner;
- no-map explains how to create or draft one;
- disabled-map explains that history is preserved;
- missing-package explains how to download it;
- restart-required offers the restart action;
- stale state keeps the message draft and labels the destination `Needs review`;
- runtime errors offer retry and return-to-chat actions.

Exit gate:

- a new user can identify the current location, inspect a destination, and choose the
  next action without opening Chat Settings;
- every action is keyboard and touch operable and does not depend on color or hover;
- the editor cannot be covered by global floating UI at mobile widths.

### Phase 5: route preview and Travel now

Goal: support distant movement without one model turn per graph edge.

Data contract:

```ts
interface SpatialTravelPlan {
  destinationId: string;
  routeLocationIds: string[];
  mode: "instant" | "narrated" | "stepwise" | "goal";
  waypointIds: string[];
  expectedDefinitionRevision: number;
  expectedCurrentLocationId: string | null;
  commandId: string;
}
```

Implementation:

- package route logic computes the fewest valid graph connections;
- client preview may suggest a route, but the server recomputes it;
- hidden, blocked, archived, missing, or disconnected steps invalidate the plan;
- `Travel now` validates the complete route atomically and injects no intermediate
  lore or memories;
- Engine records a typed spatial travel event with the resulting snapshot;
- the event participates in reload, branch, deletion, import, export, and checkpoints;
- no fake user dialogue or invisible model turn is created.

Exit gate:

- accepted instant travel produces zero model turns and one inspectable history
  anchor;
- stale or invalid routes produce no partial movement;
- history restores the same destination in all supported flows.

### Phase 6: narrated, stepwise, waypoint, and goal travel

Deliver each mode in a separate reviewable slice:

- `Narrate journey`: one bounded route projection, one model turn, then destination
  context becomes current.
- `Explore each stop`: existing one-hop atomic movement for each accepted owner turn.
- Waypoints: user-authored ordering only; do not invent scenic ranking.
- `Set as goal`: save route intent without moving or calling a model.

Exit gate:

- each mode produces the documented number of turns;
- intermediate lore activates only in stepwise mode;
- waypoint and goal state survives reload and becomes `Needs review` when stale;
- prompt preview names the travel projection and any truncation.

### Phase 7: evaluation and earned expansion

Compare old-map-only, old map plus lorebooks, and hierarchical spatial context using
the same models, transcripts, and world definitions. Measure location accuracy,
invalid exits, movement continuity, history restoration, prompt cost, generation
latency, authoring effort, and user success finding travel controls.

Define thresholds before collecting results. If the hierarchy does not materially
improve orientation or authoring, simplify it before adding creator starter maps,
visual identity, Connected Conversation, or model-requested movement.

## Cross-repository validation

### Agents repository checks

- catalog and manifest schema validation;
- reproducible package build from package-owned source;
- source-boundary check rejecting private Engine imports and `sources/engine` inputs;
- server activation, self-check, cleanup, and rollback fixtures;
- focused graph, definition, drafting, movement, route, lore, and prompt regressions;
- package E2E suite against a launched Engine fixture.

### Engine repository checks

```bash
pnpm check
pnpm regression:spatial
pnpm regression:prompt
pnpm smoke:ui
```

Repair `regression:spatial` so it tests the installed package or public host contract
instead of importing deleted private implementation files.

### Artifact compatibility matrix

For every executable Hierarchical Maps release, CI must:

1. build the exact archive that will be published;
2. start the supported Engine version with a clean profile;
3. install the archive through the normal installer;
4. verify restart-required behavior;
5. restart and wait for package readiness;
6. run GET, PUT, create, expand, move, generation, dry run, Peek Prompt, swipe,
   branch, checkpoint, import, export, uninstall, and reinstall flows;
7. repeat the data-sensitive subset against an upgraded V3 fixture;
8. verify the built artifact hashes match the catalog entry.

A catalog release cannot merge if this matrix did not test that exact artifact.

## Proof matrix

| Claim                     | Automated proof                                                                                                 | Manual proof                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Package is compatible     | Exact published artifact runs against every declared Engine minor                                               | Install, restart, update, rollback, and reinstall from Download Agents     |
| User data survives        | Upgrade, missing-package, uninstall, reinstall, backup, and restore fixtures preserve definitions and snapshots | Open an existing campaign before and after each lifecycle action           |
| Storage is stable         | Package uses only capability API operations; transaction failure injection leaves no partial state              | Force a stale write and confirm map, message, and draft remain intact      |
| Prompt paths agree        | Normalized projection comparison across generation, Game GM, dry run, retry, continuation, and Peek Prompt      | Inspect Active Context, Peek Prompt, and debug prompt for both owner modes |
| Lore eligibility is exact | Disabled, excluded, missing, duplicate, forced, and truncated fixtures                                          | Move between locations with different enabled and disabled lore            |
| History is authoritative  | Reload, swipe, regeneration, continuation, branch, deletion, import, export, and checkpoint fixtures            | Exercise representative flows in Roleplay and Game                         |
| UI fails safely           | Host-state component tests plus package E2E for loading, missing, restart, incompatible, error, and ready       | Desktop and mobile checks in dark, light, and SillyTavern themes           |
| Travel is deterministic   | Valid, blocked, hidden, archived, disconnected, stale, waypoint, and idempotency fixtures                       | Preview each mode and force a stale route before commit                    |
| Context is bounded        | Deep, wide, long-text, route, and lore budget assertions                                                        | Inspect a maximum-size map and prompt preview                              |

## Release and pull-request sequence

Recommended dependency order:

1. Engine issue and draft PR: readiness states, compatibility diagnostics, and
   cross-repository test harness.
2. Agents issue and draft PR: `1.0.1` compatibility recovery.
3. Engine issue and draft PR: capability API v1 and typed storage or transaction
   operations.
4. Agents issue and draft PR: package-owned source and `1.1.0`.
5. Paired Engine and Agents PRs: V3 restoration proof and removal of obsolete
   compatibility shims.
6. Agents PR: runtime world-map simplification.
7. Paired contract and package PRs: typed travel event plus `Travel now`.
8. Separate Agents PRs for narrated, stepwise, waypoint, and goal travel.
9. Evaluation report and a maintainer decision before any deferred expansion.

Every implementation issue identifies its owner on the issue before work begins.
Every implementation branch opens a draft PR immediately. PR descriptions explain
the user problem, identify the exact artifact under test, and leave all manual test
checkboxes unchecked.

## Definition of done

The recovery and continuation effort is complete when:

- Hierarchical Maps installs from Download Agents on a clean Engine profile;
- upgraded users retain every prior definition, snapshot, binding, lore link, and
  active chat selection;
- the package reports ready only after a functional self-check;
- the package source is owned by Marinara Agents and imports no private Engine paths;
- the published artifact declares and passes a versioned capability API contract;
- all delivered V3 packages A through F.2 pass their original acceptance criteria;
- runtime UI clearly handles loading, restart, missing, incompatible, error, empty,
  conflict, and ready states;
- Roleplay and Game share one spatial authority and one understandable world-map
  experience;
- travel modes have deterministic history and prompt behavior;
- Engine health and package readiness are independently observable;
- exact-artifact cross-repository CI prevents the storage ABI regression from
  recurring;
- manual desktop, mobile, keyboard, touch, and theme checklist items remain visible
  for a human contributor to verify.
