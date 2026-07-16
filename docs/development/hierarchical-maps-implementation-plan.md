# Hierarchical Maps Implementation Plan

Status: canonical sequencing index; recovery is active, Maps 1.0.6 is the stable
user-facing release, and future travel work is blocked

Last updated: 2026-07-15

This document answers two questions: **what is authoritative now?** and **what is
implemented next?** Detailed product requirements, UX evidence, and proof criteria
remain in the linked documents rather than being copied here.

## Document map

| Document                                                                                 | What it governs                                                     | How to use it                                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`hierarchical-maps.md`](../agents/hierarchical-maps.md)                                 | Current user behavior and workarounds                               | Keep accurate for the version users can install              |
| [`hierarchical-maps-creation-ux-notes.md`](./hierarchical-maps-creation-ux-notes.md)     | Observed first-map and global-Agent-page friction                   | Use as the evidence and acceptance source for creation UX    |
| [`hierarchical-maps-addon-recovery-plan.md`](./hierarchical-maps-addon-recovery-plan.md) | Package recovery architecture, phases, exit gates, and proof matrix | Use for all work required before new travel features         |
| [`hierarchical-maps-future-roadmap.md`](./hierarchical-maps-future-roadmap.md)           | Product work after recovery, including creation UX and travel       | Do not treat exploratory sections as approved implementation |
| [`hierarchical-locations-prd-v3.md`](./hierarchical-locations-prd-v3.md)                 | Historical V3 product and architecture baseline                     | Preserve as history; do not rewrite it for package recovery  |
| [`optional-agent-packages.md`](./optional-agent-packages.md)                             | Generic Engine package lifecycle and capability boundaries          | Use when deciding whether a contract belongs in Engine       |

When the documents appear to conflict, the stable shipped behavior and data-safety
rules win first, the recovery plan governs unfinished recovery work, and the future
roadmap begins only after the applicable recovery gate passes. This file owns order
and status, not the detailed requirements.

## Current implementation snapshot

| Area                                 | Status                      | Evidence or remaining gap                                                                                                                                                |
| ------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stable user release                  | Shipped                     | Maps 1.0.6 is in the main Agents catalog; the broken 1.0.0 experience is no longer the offered release                                                                   |
| Workspace and runtime recovery       | Shipped to Agents `staging` | PR #35 merged at `533560a`; desktop/mobile authoring, Roleplay/Game runtime maps, and owner-turn authority are restored                                                  |
| Package-owned Maps implementation    | Candidate                   | Maps-owned source lives under `packages/hierarchical-maps/src/engine` on `feature/hierarchical-maps-package-source-16`                                                   |
| Existing Game reconciliation         | Candidate                   | 1.1.0 previews exact matches, reports ambiguity, requires review, applies atomically, and makes retry a no-op                                                            |
| Exact lifecycle proof                | Candidate                   | Route-host readiness, update, owner-turn persistence and replay rejection, offline restart, remove, reinstall, backup, and restore pass against the exact 1.1.0 archive  |
| Capability compatibility declaration | Candidate                   | 1.1.0 uses manifest v2 and capability API 1.2 against the exact paired Engine checkpoint `c797c0da1`; Engine support must land before publication                        |
| Private Engine isolation             | Candidate                   | The guarded inventory reached zero from 52. Maps now builds from package-owned source only, while generic host UI state crosses explicit contribution props and events   |
| Full V3 history and prompt parity    | Open                        | Retry, continuation, regeneration, swipe, branches, deletion, import/export, checkpoints, and every prompt surface remain incomplete                                     |
| Creation UX                          | Planned                     | The walkthrough and global blank-agent-editor problem are documented; implementation waits behind recovery-critical work except for independently safe package UI slices |
| Travel modes                         | Blocked                     | Do not begin Travel now, narrated, stepwise, waypoint, or goal travel yet                                                                                                |

The current Agents candidate checkpoint is `737f859` on
`feature/hierarchical-maps-package-source-16`. Its paired generic Engine checkpoint
is `c797c0da1` on `feature/capability-runtime-logging` in the `thetopham` fork.

No completed issue should be reopened for this continuation. Continue using local
commits and the existing feature/docs branches as checkpoints. Do not open another
issue or pull request until the relevant slice is complete and ready for review.

## Ownership boundary

The default is **Agents owns Maps; Engine owns only reusable host capability**.

| Concern                                                                                                                                                       | Owner                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Maps source, prompts, feature routes, package UI, settings, versions, manifests, artifacts, and catalog entries                                               | Marinara Agents                                                 |
| Generic package loading, compatibility, readiness, contribution slots, provider/model routing, storage and transaction operations, and feature-host UI states | Marinara Engine                                                 |
| A Maps-specific database table, route, prompt, setting, or editor component                                                                                   | Marinara Agents, not Engine                                     |
| A typed operation that several optional packages can safely use without importing Engine internals                                                            | Marinara Engine, kept narrow and inert until a package calls it |

If a package change requires a new Engine contract, the Engine change lands first.
The Agents catalog must not advertise a version that requires an unavailable host
contract. Avoid copying more Engine source into the package to bypass this order.

## Delivery sequence

### 1. Finish the 1.1.0 package boundary

Priority: P0, active.

Already implemented in the candidate:

- package-owned Maps implementation overlay;
- existing-campaign Game-map reconciliation;
- exact-artifact update and lifecycle regression;
- manifest v2 compatibility metadata and exact build provenance;
- package-owned ID/time generation, Game-map metadata normalization, client class
  merging, and client command-ID generation;
- capability API 1.2 package logging, debug-state, transaction-scoped chat/message
  and definition-metadata writes, lore-entry existence reads, and compatibility
  snapshot operations, normalized chat/character/lore resource reads, JSON-ish
  parsing, and secret-free language-model resolution and calls;
- zero private Engine imports in Maps server code, with Maps no longer importing
  private logger, runtime configuration, provider, lore helper, storage,
  database/schema, or JSON parser paths;
- zero private Engine imports in Maps client code, with package-local REST,
  React Query resources, pending-move persistence, and explicit host props/events
  replacing private Engine hooks, stores, dialogs, and settings components;
- a source-only Maps build root that no longer copies captured generic Engine
  sources before bundling;
- exact-artifact owner-turn proof covering one atomic move and duplicate-command
  rejection, missing-lore warnings, runtime facade readiness, and route-level
  connection resolution through the host facade;
- transaction rollback proof covering atomic definition metadata and bootstrap
  snapshot replacement; and
- a zero-private-import assertion enforced during build and catalog validation.

The implementation portion of this boundary is complete at Engine `c797c0da1`
and Agents `737f859`. Before publication:

1. Keep Engine support ahead of the dependent Agents catalog publication.
2. Repeat desktop/mobile and manual package readiness proof before publishing.
3. Keep the manifest, payloads, ZIP, catalog entry, and exact Engine provenance
   synchronized for every candidate rebuild.

Exit: Maps builds from package-owned source without a private Engine import, raw
database access, or copied table object, and uninstall/reinstall preserves its data.

### 2. Complete recovery parity

Priority: P0 after the package boundary.

- Cover retry, continuation, regeneration, swipe, branch, deletion, import/export,
  and checkpoint behavior in both owner modes.
- Compare normal generation, Game GM, dry run, live Peek Prompt, and cached Peek
  Prompt projections from one normalized fixture.
- Prove disabled, excluded, missing, duplicate, forced, and truncated lore cases.
- Complete keyboard, touch, theme, long-label, deep-map, conflict, stale-write, and
  error-state review.

Exit: Phase 3 and the applicable Phase 4 recovery gates in the recovery plan pass.

### 3. Simplify first-map creation

Priority: P1 after recovery-critical parity, with independent Agents-owned editor
slices allowed once they cannot destabilize the package boundary.

Use the creation UX notes as the acceptance source. The intended result is one clear
path from activation to a fully inspectable draft, explicit regenerate/discard
choices, starting-location confirmation, and one understandable enable-and-save
finish. The global **Agents → Hierarchical Maps** page must be package-owned or a
clear feature landing page, not an empty pipeline-agent editor.

Keep Engine work generic: feature-detail hosting, contribution navigation, and
activation handoff only. Recursive preview, regeneration, map defaults, expansion,
and first-save behavior remain in Marinara Agents.

Exit: a new user can install, activate, create, inspect, reject or regenerate, set a
start, enable, and save without visiting irrelevant blank settings.

### 4. Re-evaluate travel

Priority: blocked.

Only after the earlier exits pass, reconsider route preview and explicit **Travel
now**. Narrated, stepwise, waypoint, goal travel, model-requested movement, starter
maps, and generic reactive scenarios remain separate later decisions. None are part
of the current 1.1.0 implementation.

## Proof and release discipline

For every executable Maps candidate:

1. build the exact archive that the catalog references;
2. validate source manifest, archive manifest, payload hashes, ZIP hash, and catalog
   entry as one immutable set;
3. install and update it through the normal Engine package manager;
4. restart offline and wait for registered/ready state;
5. prove missing-package, uninstall, reinstall, backup, and restore preservation;
6. run focused owner-authority, Game binding, history, prompt, and desktop/mobile
   suites for the changed slice; and
7. record manual verification as unchecked human tasks in any eventual PR.

Do not add screenshots or recordings. Do not change a package version without
changing its Marinara Agents manifest, artifact, and catalog entry together.

## Maintaining this plan

- Update the snapshot and sequence here when a checkpoint materially changes what
  is next.
- Put architecture detail and recovery exit criteria in the recovery plan.
- Put observed creation problems and UX acceptance criteria in the creation notes.
- Put speculative post-recovery features in the future roadmap.
- Keep the user guide limited to behavior users can actually run.
- Leave the historical V3 PRD unchanged.
