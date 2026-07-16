# Hierarchical Maps Creation UX Notes

Status: observed baseline for Hierarchical Maps 1.0.6; recursive Draft preview is
implemented in the unreleased 1.1.0 candidate at `9e1883f`

Date observed: 2026-07-15

Audience: product, design, Marinara Engine contributors, and Marinara Agents contributors

Coordination: [`hierarchical-maps-implementation-plan.md`](./hierarchical-maps-implementation-plan.md)
owns delivery order; this note owns the walkthrough evidence and UX acceptance
criteria.

## Summary

Creating a first Hierarchical Map works, but the current journey asks the user to understand package installation, package updating, a misleading global Agent editor, per-chat agent activation, a separately mounted map setting, AI draft semantics, a non-browsable preview, a collapsed working hierarchy, starting-location rules, and separate Enabled and Save controls.

The underlying safety model is sound: generated results remain a working copy, explicit Save is required, current location is authoritative, and committed history protects location IDs. The interface does not explain those boundaries at the moments when the user must act on them.

This note records the current experience so future work can reduce creation friction without weakening those protections.

## Implementation checkpoint — July 16, 2026

The first independently safe Marinara-Agents slice is implemented against the
package-owned client boundary:

- Draft preview shows the complete generated hierarchy before apply;
- roots open through the first useful level, with per-node expand/collapse plus
  Expand all and Collapse all;
- search matches location names, kinds, public descriptions, and private model
  memories while preserving ancestor context;
- the preview reports generated location count, maximum depth, unsaved or
  unapplied state, and the proposed starting location;
- selecting a location exposes its public description, private model memory, and
  lore provenance;
- **Regenerate**, **Edit prompt**, **Discard draft**, and **Continue to editor**
  replace the easy-to-miss **Generate another** and ambiguous **Use this draft**
  decision; and
- exact-artifact creation, expansion, Game setup review, and skip flows pass on
  desktop and mobile.

This checkpoint changes no persistence or history contract. Continuing still
loads an unsaved working copy, and Save remains the persistence boundary. The
global Maps home, direct activation handoff, first-map progress strip,
applied-draft regeneration, inline starting-location confirmation, one-step enable
and save, and simplified expansion controls remain open.

## Observed first-map journey

1. Open **Agents → Download Agents**.
2. Install **Hierarchical Maps**.
3. Install the offered package update as a second action.
4. Restart Marinara when requested.
5. Open the target chat's **Chat Settings → Agents**.
6. Find **Tracker Agents** and enable **Hierarchical Maps** again for this chat.
7. Scroll back up to the newly available **Hierarchical map** chat setting.
8. Click **Edit hierarchical map**.
9. Click **Create map**, then **Draft with AI**.
10. Describe the desired world and generate the draft.
11. Wait for generation.
12. The **Draft preview** shows only the first/top-level location. Its sublevels cannot be opened or inspected there.
13. Click **Use this draft** despite not yet seeing the complete result.
14. The full working map opens with its hierarchy collapsed or otherwise not immediately legible.
15. Expand and select locations one at a time to inspect the generated hierarchy.
16. Find or choose the starting location.
17. Turn on **Enabled**.
18. Click **Save**.

The user reaches a usable result, but the funnel contains several points where the next action is not obvious and the meaning of the action is unclear.

The immediate update was observed during a catalog transition. Now that Maps 1.0.6 is the current main-catalog release, a fresh installation should not normally require an immediate second update. Keep **Update if offered** in user documentation as a compatibility instruction, but investigate a fresh current-version install that still presents this sequence instead of treating it as permanent product behavior.

There is also a misleading alternate route after installation. **Agents → Hierarchical Maps** opens the generic agent editor. It presents empty connection, prompt-template, named-prompt-option, tool, and other pipeline-agent controls even though the package declares Hierarchical Maps as a feature-backed agent with no default prompt or settings. None of these fields are required to create or run a map.

## Main friction points

### Installation and activation feel duplicated

Installing the package and updating it are separate catalog actions. Enabling it for a chat is another action under **Tracker Agents**. Only then does the separate **Hierarchical map** setting appear elsewhere in Chat Settings.

The system is correctly separating global package availability from per-chat activation, but the UI presents these as repeated enablement rather than a clear sequence:

```text
Install capability → update capability → restart → activate for this chat → configure its map
```

### The global Agents page presents the wrong editor

Hierarchical Maps appears in the top-right **Agents** panel after installation. Opening it routes to the generic pipeline-agent editor, where blank prompt and option fields make the package appear unfinished or unconfigured.

This surface contradicts the package's actual execution model. Hierarchical Maps is a feature-backed agent: chat activation enables package-owned runtime and UI contributions, while map creation happens in the package workspace. It does not need a user-authored system prompt, connection override, named prompt option, tool selection, or normal pipeline execution settings.

This is more than an empty-state problem. It creates a parallel false setup path and asks the user to decide whether blank technical fields must be completed before the map will work.

### The map setting appears away from the activation control

After enabling Hierarchical Maps under Tracker Agents, the user must scroll back to find the map card that was just mounted. There is no direct **Configure map** handoff from the activation row.

### The creation flow has too many nested starts

The path includes **Edit hierarchical map → Create map → Draft with AI → Generate draft → Use this draft** before the complete map becomes inspectable. Several labels describe implementation state rather than the user's goal.

### Draft preview is not a full preview

The preview displays a top-level summary and validation information, but it does not expose the generated tree. When a draft has one root location, the screen can look as if the AI generated only one place even when many descendants exist.

The primary action **Use this draft** therefore asks for commitment before the user has enough information. Technically it applies only to a local working copy, but that safety boundary is not prominent enough to offset the missing inspection.

### The applied draft initially hides its value

After **Use this draft**, the full hierarchy is present but collapsed. The user must discover the hierarchy disclosure controls and inspect locations individually. The transition does not orient the user to the generated root, descendant count, starting location, or unsaved state.

### Rejecting a draft is unclear

Before a result is applied, the AI builder already offers **Generate another**. That action is easy to overlook and arrives before the user can inspect the generated descendants. It therefore does not solve the important rejection case: deciding that the draft is unsuitable after seeing the complete hierarchy.

After **Use this draft**, the AI builder refuses to generate over dirty editor changes, which protects work. There is no obvious **Discard and regenerate** action in the editor. The current workaround is:

1. Use **Back to chat**.
2. Confirm **Discard changes**.
3. Reopen **Edit hierarchical map**.
4. Run **Draft with AI** again.

For a saved map with no committed history, **Expand with AI → Replace draft** can create a replacement. Once history exists, replacement is intentionally blocked and only expansion is allowed. These cases are not explained where the user decides whether to keep the first draft.

### Starting location, Enabled, and Save are separate concepts

The user must understand that a valid starting location is required, **Enabled** controls whether the hierarchy affects turns, and **Save** persists the working definition. These controls are separated across the Details pane and header, so the final activation step feels like a checklist the user must infer.

### Expand with AI exposes the whole system at once

Expansion presents the target location, setup versus lore sources, strict versus expansive grounding, lorebook selection, instructions, and size together. Those are useful controls, but the common action—add a few places beneath the selected location—does not have a short path.

## Proposed experience

### 1. Make the global Agent entry the Maps home

When an installed agent declares feature-owned execution, do not open the generic pipeline-agent editor. Engine should provide a generic feature-detail host, and the package should contribute its own Hierarchical Maps home inside it. If a package does not contribute a detail view, fall back to a small read-only feature summary rather than the pipeline editor.

The Maps-owned global page should combine:

- installed version and readiness or restart state;
- supported chat modes and concise documentation;
- the current chat's activation and map status when a chat is open;
- **Create map** or **Open map** for the current chat;
- **Manage package**; and
- genuine global authoring defaults that the package actually supports.

Candidates for global defaults include default draft and expansion sizes, reusable world-building guidance, an optional map-generation connection override with **Use chat connection** as the default, and an advanced package-owned generation-prompt override with a visible built-in default and **Reset**. These are candidates to validate, not a requirement to expose every implementation knob.

Do not show generic pipeline prompt templates, named prompt options, connections, tools, token limits, or run-frequency controls unless Maps explicitly wires an equivalent setting to package behavior. Starting location, current location, hierarchy contents, selected lorebooks, Game bindings, enabled state, committed history, and unsaved drafts remain chat-specific.

Engine should own only the generic feature-detail contribution contract and host. The Hierarchical Maps page, settings schema, defaults, validation, and behavior belong in Marinara Agents.

### 2. Add a direct activation handoff

After the user enables Hierarchical Maps under Tracker Agents, show one primary action beside it:

- **Create map** when the chat has none.
- **Open map** when one exists.

If a restart or update is still required, show that state in the same row instead of mounting a configuration card that cannot yet work.

Use distinct state language across the route:

- **Installed in Marinara**;
- **Active in this chat**;
- **Working draft, not saved**;
- **Saved, map disabled**; and
- **Saved, map active for turns**.

### 3. Use one first-map workspace

Present the initial creation flow as a compact progress strip or state checklist inside one workspace:

1. **Build** — AI draft, manual map, or import.
2. **Review** — inspect the complete generated hierarchy.
3. **Start here** — confirm the starting location.
4. **Enable map** — save and activate it for turns.

The safety boundary should be visible throughout: `Working draft · not saved`.

These labels must not become four mandatory pages or another nested wizard. Build and Review should share the hierarchy surface, the proposed starting location should be confirmable inline, and returning users with an existing map should bypass first-map guidance.

### 4. Make Draft preview recursively browsable

The preview should show:

- total generated locations and maximum depth;
- an expandable tree with every generated location;
- the proposed starting location;
- validation issues beside the affected node;
- lore provenance without replacing the hierarchy view; and
- a location details panel or disclosure for description and private memory.

The primary actions should be **Regenerate**, **Edit prompt**, and **Continue to editor**. **Regenerate** should make the existing **Generate another** capability prominent. **Continue to editor** better describes the current local-only behavior than **Use this draft**.

For deep or broad maps, complete inspection must remain bounded. Keep the tree collapsed beyond the first useful level, provide expand/collapse and search controls, allow filtering to validation issues, and use incremental or virtualized rendering if measurements show it is needed. A truthful complete preview does not require rendering every node expanded at once.

### 5. Orient and preserve the working draft after apply

When a draft enters the editor:

- expand the generated root and one useful level of descendants;
- select the proposed starting location;
- show a compact `16 locations · 4 levels · not saved` summary; and
- keep a visible **Discard draft** or **Regenerate** action until the first save.

Preserve the generation inputs and generated candidate until first save. Regeneration after full inspection should replace only the applied generated draft after confirmation. It must not silently discard unrelated manual edits, an imported map, or previously saved work.

### 6. Make first activation one explicit action

For a valid new draft, replace the separate mental model of starting location, Enabled, and Save with a primary **Enable and save map** action. If the starting location is missing, that action should open a focused chooser rather than leaving the user to find the control in Details.

Keep ordinary **Save** and Enabled controls available for later editing and temporary deactivation.

After the first successful save, end with a concrete result and one return path, for example: `Map ready · 16 locations · Starting at Tideglass Inn`, followed by **Return to chat** and a short cue explaining where **Story location** now appears.

### 7. Give expansion a simple path and an advanced path

Default the target to the location selected when **Expand with AI** was opened. The first view needs only:

- **What should be added?**
- size; and
- **Generate expansion**.

Put setup/lore grounding, lorebook selection, and replacement controls under **Advanced options**. If no committed history exists, expose **Replace entire draft** as a clearly destructive alternative, not as a sibling of the common expansion action.

## Suggested acceptance criteria

- Opening **Agents → Hierarchical Maps** presents a package-owned Maps home rather than the generic pipeline-agent editor.
- The generic Engine host exposes package readiness and mounts a feature-provided detail view without Hierarchical Maps-specific UI or settings logic.
- The Maps home shows the current chat's activation and map state and offers **Create map** or **Open map** when a chat is available.
- Every editable global Maps setting has a meaningful default, validation, reset behavior, and a proven effect in the package-owned builder or runtime.
- Chat-specific hierarchy, location, lore, binding, history, enabled, and working-draft state is never silently promoted to global state.
- A fresh installation of the current catalog version does not immediately require an update. If an update is required, the reason and readiness sequence are explicit.
- A user can go from per-chat activation to the map creator without scrolling to find a newly mounted setting.
- First-map stages are visible in one workspace and do not add four mandatory screens.
- A generated draft's complete hierarchy is inspectable before it enters the working editor.
- The interface never makes a many-location hierarchy look like a one-location result.
- **Generate another** or its replacement is clear before apply, and a user can reject and regenerate an applied unsaved draft after full inspection without leaving the workspace.
- Regeneration replaces only the generated candidate and does not discard unrelated manual or imported edits.
- The proposed starting location is visible before activation.
- A valid first map has one clear **Enable and save map** action.
- First save reports the resulting location count and starting location and offers one clear return to chat.
- Expansion opens with the selected location as its default target and hides uncommon grounding controls until requested.
- Replacement remains unavailable after committed spatial history exists.
- Import, save, revision-conflict, and stable-location-ID protections remain unchanged.
- Desktop and mobile expose the same creation states and actions, even when their layouts differ.
- Keyboard and screen-reader users can browse, expand, select, inspect, regenerate, choose a starting location, and finish the first map.
- Deep maps, long labels, validation-heavy drafts, generation failure, interruption, reload, and revision conflict preserve an understandable working state.
- Returning users and existing maps bypass first-map guidance.

## Ownership routing

This experience crosses repository boundaries and should be split by ownership when implementation starts.

### Marinara Engine

- Agents catalog install, update, restart, and readiness handoff.
- A generic feature-agent detail host and contribution contract that suppresses irrelevant pipeline configuration.
- Per-chat Tracker Agent activation and the direct **Create map/Open map** handoff.
- Chat Settings contribution placement, scrolling, and focus behavior.
- Shared capability contracts needed for activation or navigation state.

### Marinara Agents

- Hierarchical Maps package-owned editor and AI builder.
- The package-owned global Maps home, applicable global defaults, validation, and reset behavior.
- Recursive draft preview and generated hierarchy inspection.
- Draft discard/regeneration affordances.
- Starting-location confirmation and first-save activation flow.
- Progressive disclosure for **Expand with AI**.

The highest-value first slice can remain Agents-owned: recursive review, applied-draft regeneration, starting-location confirmation, first-save completion, and simplified expansion. A paired global-page slice should keep Engine generic and narrow while Maps supplies the actual page and settings from Marinara Agents. Do not block package-owned editor improvements on Engine work unless a genuinely shared host contract is required.

If a single issue is used for product discussion, implementation should still be divided by repository ownership so package-owned UI changes target the `staging` branch of the correct repository. Do not reopen a completed recovery issue merely to track this future usability work.

## Documentation workaround until the UI changes

The user guide should state explicitly that:

- the package must be installed or updated globally and then enabled for each chat;
- the global **Agents → Hierarchical Maps** detail currently shows generic blank agent fields that are not required for map setup;
- Draft preview is only a top-level summary;
- **Generate another** is available before applying a result, but rejecting an applied draft after full inspection still requires discarding and reopening;
- **Use this draft** loads an unsaved working copy rather than saving it;
- the complete hierarchy is inspected after applying the draft;
- an unwanted unsaved draft is discarded by leaving the editor and reopening it; and
- starting location, Enabled, and Save are all required before the first map affects turns.
