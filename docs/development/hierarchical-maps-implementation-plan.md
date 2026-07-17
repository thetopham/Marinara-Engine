# Hierarchical Maps Implementation Plan

Status: canonical sequencing index; recovery through Phase 4 is shipped in Maps
1.1.5 with Marinara Engine 2.3.2, and Phase 5 route planning is the current
continuation frontier

Last updated: 2026-07-17

This document answers two questions: **what is authoritative now?** and **what is
implemented next?** Detailed product requirements, UX evidence, and proof criteria
remain in the linked documents rather than being copied here.

> **Start here.** This is the canonical Hierarchical Maps documentation index,
> current-status summary, and delivery-order guide. The other documents own their
> narrower subjects; use the paths below instead of treating every file as a
> competing plan.

## Reading paths

- **Use or troubleshoot the feature:** read the
  [user guide](../agents/hierarchical-maps.md).
- **Implement or review the current package:** start with the
  [current implementation snapshot](#current-implementation-snapshot), then use
  the [recovery plan](./hierarchical-maps-addon-recovery-plan.md) for the completed
  recovery requirements and the remaining continuation gates.
- **Understand the product and data model:** read the
  [V3 PRD](./hierarchical-locations-prd-v3.md).
- **Improve first-map creation:** use the
  [creation UX notes](./hierarchical-maps-creation-ux-notes.md) as observed
  evidence, then check this file for sequencing.
- **Plan current and future work:** use the
  [future roadmap](./hierarchical-maps-future-roadmap.md) and the linked upstream
  issues after confirming the package boundary that owns the change.

## Document map

| Document                                                                                 | Authority                                                      | Use it for                                                      |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| **This implementation plan**                                                             | Canonical index, current status, ownership, and delivery order | Deciding what is authoritative now and what is implemented next |
| [`hierarchical-maps.md`](../agents/hierarchical-maps.md)                                 | Current stable user-facing behavior and workarounds            | Setup, authoring, movement, and troubleshooting                 |
| [`hierarchical-maps-addon-recovery-plan.md`](./hierarchical-maps-addon-recovery-plan.md) | Completed recovery requirements and continuation gates         | Understanding the shipped recovery and the Phase 5 boundary     |
| [`hierarchical-locations-prd-v3.md`](./hierarchical-locations-prd-v3.md)                 | Historical product, data-model, and architecture baseline      | Understanding the original V3 decisions without rewriting them  |
| [`hierarchical-maps-creation-ux-notes.md`](./hierarchical-maps-creation-ux-notes.md)     | Observed first-map UX evidence and acceptance criteria         | Designing and validating creation-flow improvements             |
| [`hierarchical-maps-future-roadmap.md`](./hierarchical-maps-future-roadmap.md)           | Active post-recovery product direction                         | Open creation, upkeep, scene-reference, and travel work         |

Supporting architecture: [`optional-agent-packages.md`](./optional-agent-packages.md)
defines the generic Engine package lifecycle and capability boundary. It supports
the Maps plans but is not a separate Hierarchical Maps product plan.

When the documents appear to conflict, the stable shipped behavior and data-safety
rules win first. The recovery plan records the completed extraction and parity
requirements; the future roadmap and linked upstream issues govern work after that
baseline. This file owns order and status, not the detailed requirements.

## Current implementation snapshot

| Area                                  | Status                 | Evidence or remaining gap                                                                                                                                                                                                                                                                                                          |
| ------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stable user release                   | Shipped                | Maps 1.1.5 is the main Agents catalog release and declares Marinara Engine `>=2.3.2 <3.0.0`                                                                                                                                                                                                                                        |
| Workspace and runtime recovery        | Shipped                | Agents PRs [#35](https://github.com/Pasta-Devs/Marinara-Agents/pull/35), [#52](https://github.com/Pasta-Devs/Marinara-Agents/pull/52), [#59](https://github.com/Pasta-Devs/Marinara-Agents/pull/59), and [#64](https://github.com/Pasta-Devs/Marinara-Agents/pull/64) delivered the recovered authoring and Roleplay/Game surfaces |
| Package-owned Maps implementation     | Shipped                | Maps builds from package-owned source with the zero-private-import boundary and immutable catalog artifact lifecycle                                                                                                                                                                                                               |
| Existing Game reconciliation          | Shipped                | The reviewed, atomic, retry-safe reconciliation flow is part of the recovered package baseline                                                                                                                                                                                                                                     |
| Capability compatibility declaration  | Shipped                | Maps 1.1.5 uses manifest v2 and capability API 1.3 against the Engine 2.3.2 host contract delivered by [Engine PR #3693](https://github.com/Pasta-Devs/Marinara-Engine/pull/3693)                                                                                                                                                  |
| Lifecycle, history, and prompt parity | Recovery gate complete | Exact-artifact coverage includes update, owner turns, prompt projection, history operations, import/export, checkpoint preservation, offline restart, remove, reinstall, backup, and restore                                                                                                                                       |
| Phase 4 runtime map                   | Shipped                | Shared Roleplay/Game browsing, current-location presentation, mobile runtime recovery, and direct one-hop movement are available                                                                                                                                                                                                   |
| Creation and editing UX               | Open follow-up         | Agents issues [#69](https://github.com/Pasta-Devs/Marinara-Agents/issues/69) through [#76](https://github.com/Pasta-Devs/Marinara-Agents/issues/76) track icon clarity, nested expansion, drag layout, custom types, timeout handling, replacement, progressive upkeep, and prompt visibility                                      |
| Multi-step navigation                 | Phase 5 planning       | [Agents issue #77](https://github.com/Pasta-Devs/Marinara-Agents/issues/77) tracks automatic route computation and a reviewable Set destination / Plan route flow                                                                                                                                                                  |
| Later visual and conversation work    | Future packages        | Agents issues [#78](https://github.com/Pasta-Devs/Marinara-Agents/issues/78) through [#80](https://github.com/Pasta-Devs/Marinara-Agents/issues/80) preserve location scene references, Storyboard manifests, and Connected Conversation projection as separate slices                                                             |

The current release manifest is Maps `1.1.5`, capability API `1.3`, built against
Marinara Engine `2.3.2` commit `614e62a38fc2d9685f9b4981a9628be9fda0fc03`.
Recovery tracking issues [Agents #51](https://github.com/Pasta-Devs/Marinara-Agents/issues/51),
[Agents #61](https://github.com/Pasta-Devs/Marinara-Agents/issues/61), and
[Engine #3691](https://github.com/Pasta-Devs/Marinara-Engine/issues/3691) are
closed. New work should use the open feature issues rather than reopening a
completed recovery issue.

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

### 1. Package boundary — complete

Priority: completed in the shipped Maps 1.1.x line.

Delivered through the recovery candidate and retained in the shipped package:

- package-owned Maps implementation overlay;
- existing-campaign Game-map reconciliation;
- exact-artifact update and lifecycle regression;
- manifest v2 compatibility metadata and exact build provenance;
- package-owned ID/time generation, Game-map metadata normalization, client class
  merging, and client command-ID generation;
- capability API 1.2 package logging, debug-state, transaction-scoped chat/message
  and definition-metadata writes, lore-entry existence reads, and compatibility
  snapshot operations, normalized chat/character/lore resource reads, JSON-ish
  parsing, and secret-free language-model resolution and calls, subsequently
  advanced to capability API 1.3 for Maps 1.1.5;
- zero private Engine imports in Maps server code, with Maps no longer importing
  private logger, runtime configuration, provider, lore helper, storage,
  database/schema, or JSON parser paths;
- zero private Engine imports in Maps client code, with package-local REST,
  React Query resources, pending-move persistence, and explicit host props/events
  replacing private Engine hooks, stores, dialogs, and settings components;
- a source-only Maps build root that no longer copies captured generic Engine
  sources before bundling;
- observable generic client-module loading, failure, and retry states with stable
  skeletons, safe full-screen escape actions, accessible error presentation, and
  44px recovery actions;
- a Maps-owned package-root error boundary that reports runtime failures through
  the public custom-element host event, supports a clean remount on retry, and keeps
  Maps workspace actions touch-sized at mobile widths;
- exact-artifact owner-turn proof covering one atomic move and duplicate-command
  rejection, missing-lore warnings, runtime facade readiness, and route-level
  connection resolution through the host facade;
- transaction rollback proof covering atomic definition metadata and bootstrap
  snapshot replacement; and
- a zero-private-import assertion enforced during build and catalog validation.

The boundary was proven at Engine `044f839f` and Agents `de663ea`, then published
and advanced through Maps 1.1.5. The focused client regression covers a failed
first module request, retry, simulated package runtime failure, remount, and 44px
recovery actions. The rebuilt ZIP also passes the complete exact-artifact Chromium
suite:
23 tests pass and 7 viewport-independent cases are intentionally skipped on
mobile. The suite covers desktop/mobile layouts, keyboard operation, 44px touch
geometry, dark/light/SillyTavern themes, long labels, a 12-level map, loading and
retry, stale-write conflict preservation/reload, movement reconciliation, creation,
Game setup, and prompt/history parity. Exact lifecycle proof separately confirms
offline restart, uninstall/reinstall, backup, and restore. The publication lane
then preserved these rules:

1. Keep Engine support ahead of the dependent Agents catalog publication.
2. Complete desktop/mobile, theme, keyboard/touch, and platform package-readiness
   checks before publishing.
3. Keep the manifest, payloads, ZIP, catalog entry, and exact Engine provenance
   synchronized for every candidate rebuild.

Exit: Maps builds from package-owned source without a private Engine import, raw
database access, or copied table object, and uninstall/reinstall preserves its data.

### 2. Recovery parity — complete

Priority: completed for the shipped recovery baseline.

Automated Phase 3 parity is complete. Roleplay and Game now prove one authoritative
spatial projection and bounded current-location lore through normal generation,
Game GM, dry run, live Peek Prompt, cached Peek Prompt, retry, continuation,
regeneration, historical swipes, branching, deletion, JSONL import/export, and
checkpoint restore. Disabled, excluded, missing, duplicate, forced, and over-budget
lore cases are included.

The browser and release closure work also proved keyboard operation, touch-sized
controls, dark/light/SillyTavern rendering, long labels, deep maps, loading/retry,
stale-write conflict recovery, committed-movement query reconciliation, and the
clean-install and upgraded-profile lifecycle. Later regressions belong in focused
issues; they do not reopen the completed extraction gate.

Exit: Phase 3 and the applicable Phase 4 recovery gates in the recovery plan pass.

### 3. Simplify first-map creation and editing

Priority: active Agents-owned follow-up work in issues #69–#76.

The first independently safe package-owned slices were proven at Engine `044f839f`
and Agents `de663ea` and are included in the shipped recovery line. Before a
generated map enters the working editor, Draft preview now
shows its recursively browsable hierarchy, location count and depth, proposed
start, searchable names and content, public descriptions, private model memories,
and lore provenance. Root locations open through the first useful level, while
Expand all and Collapse all keep large results controllable. The decision actions
are now **Regenerate**, **Edit prompt**, **Discard draft**, and **Continue to
editor**. Focused exact-artifact browser coverage passes creation, expansion, Game
setup review, and skip behavior on desktop and mobile. No save, stable-ID, history,
or Engine contract changed.

The installed **Hierarchical map** setting also remains visible before per-chat
activation. Its package-owned **Use in this chat** switch calls a generic Engine
activation prop, then exposes Create/Edit in the same section. Exact-artifact
desktop/mobile proof verifies inactive discovery, persistence, a 44px target, and
the resulting create action without scrolling through the lower Agents catalog.

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

### 4. Phase 5 route planning

Priority: current planning frontier in Agents issue #77.

The recovered runtime currently moves only to a directly connected location.
Implement reviewable automatic route computation and **Set destination / Plan
route** before reconsidering explicit **Travel now**. Narrated, stepwise, waypoint,
goal travel, model-requested movement, starter maps, and generic reactive scenarios
remain separate later decisions. None are part of Maps 1.1.5.

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
