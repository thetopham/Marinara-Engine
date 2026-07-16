# Hierarchical Maps Phase 2 Mobile UX Issue Drafts

Status: Ready to file; GitHub issue creation was blocked because the connected GitHub App lacks issue-write permission and the local `gh` token is invalid.

Human sign-off result: **FAIL — real mobile device**

Candidate under test:

- Marinara Engine: `2.3.1+8afe4a2857ae` (`8afe4a2857ae5731a494dcc765a20ebfddbfbaef`)
- Hierarchical Maps: `1.1.0` (`3b19f15949e039bd7c56b54543ee1a2582770f8e`)
- Package status during the test: active and ready
- Server errors during the test: none

Coordination search: no matching open issue, pull request, or mobile-named branch was found in either `Pasta-Devs/Marinara-Engine` or `Pasta-Devs/Marinara-Agents` using the Story Location, CYOA, mobile, landscape, and Hierarchical Maps terms.

The finding crosses the package boundary and should be split as follows:

1. Marinara Engine owns mobile Game control composition, CYOA visibility, contribution placement, Inventory/Combat controls, and the overall Game shell.
2. Marinara Agents owns the Hierarchical Maps Story Location presentation and full-screen map editor chrome.

## Draft 1: Pasta-Devs/Marinara-Engine

Title: `[Issue]: Mobile Game controls let Story Location crowd out CYOA choices`

Label: `bug`

### Issue body

## Summary

On a real mobile device, the Hierarchical Maps Story Location surface occupies too much of the Game viewport. With CYOA enabled, the location surface can push the CYOA choices out of view, leaving the Game action hierarchy unusable even though Story Location itself opens and closes correctly.

## Expected behavior

- CYOA choices remain visible and usable as a primary Game action surface.
- Story Location is represented by a compact Game control, such as a button near Inventory and Combat, or another priority-aware host placement.
- Expanding Story Location does not permanently crowd out CYOA or the message/action area.
- Inventory, Combat, Story Location, CYOA, and other Game contributions have a coherent mobile hierarchy rather than stacking without a viewport budget.
- Landscape and portrait layouts reserve enough space for primary Game content.
- The hosted `world-map` contribution receives a safe action for opening the chat's full-screen hierarchical-map editor, allowing the package to offer direct editing from the minimap without importing Engine-private UI state.

## Actual behavior

- The Story Location bar is too large on mobile.
- With CYOA enabled, the CYOA choices may not be visible because the location surface consumes the available vertical space.
- Opening and closing Story Location works, but collapsing it does not solve the overall Game-mode control hierarchy problem.
- Engine hosts the hierarchical world map without providing an editor-opening action, so users must leave the minimap and detour through Chat Settings before they can edit location descriptions or other map details.
- The human tester also found that Game-mode mobile UX needs a broader hierarchy and density review.

## Steps to reproduce

1. Run Marinara Engine `2.3.1+8afe4a2857ae` with Hierarchical Maps `1.1.0` active and ready.
2. Open a Game campaign on a real mobile device.
3. Enable or reach a turn with visible CYOA choices.
4. Observe the Story Location surface alongside the Game controls and CYOA area.
5. Open and close Story Location.
6. Confirm that the large location surface competes with the CYOA choices and can leave them outside the usable viewport.
7. Open the hierarchical world-map/minimap surface and confirm there is no direct control for opening the full-screen map editor.

## Environment

- Marinara Engine version: `2.3.1+8afe4a2857ae` (candidate commit `8afe4a2857ae5731a494dcc765a20ebfddbfbaef`)
- Install type: source; exact local candidate
- OS + version: real mobile device; exact OS/version was not recorded during sign-off
- Browser or app shell: not recorded during sign-off

## Logs, screenshots, or video

No screenshot or recording was captured. Engine health remained OK, Hierarchical Maps reported `ready`, and no server errors were logged during the human test.

## Additional context

This was found during the required Phase 2 human mobile/touch sign-off and is a release-sign-off failure. The related package-owned Story Location and landscape map-editor problem should be tracked in `Pasta-Devs/Marinara-Agents` and linked here after filing.

Keep this issue focused on the Engine-owned Game shell, contribution placement, CYOA visibility, and mobile control hierarchy. The broader Game-mode UX observation can inform a later audit, but it should not obscure this reproducible blocker.

Ownership is currently unassigned; no implementation has started.

## Template check

- [ ] I DID NOT read this template and provide the requested details.

## Draft 2: Pasta-Devs/Marinara-Agents

Title: `[Issue]: Hierarchical Maps mobile chrome and minimap editing affordance need recovery`

Label: `bug`

### Issue body

## Summary

Hierarchical Maps `1.1.0` uses too much mobile screen space in both its Story Location runtime surface and its full-screen editor. On a real mobile device, portrait editor use is acceptable, but landscape becomes effectively unusable because the editor header consumes almost the entire viewport. The actual world-map/minimap surface also lacks a direct button for opening the full-screen editor to change location descriptions and other map details.

## Affected package

Hierarchical Maps (`hierarchical-maps`)

## Expected behavior

- Story Location has a compact, host-friendly mobile presentation that can be composed with Game actions.
- Expanding or collapsing Story Location does not crowd primary Game content.
- The full-screen map editor preserves a usable content area in mobile landscape.
- Header actions remain reachable without dominating the viewport.
- The currently usable portrait behavior remains intact.
- The world-map/minimap header includes a compact, accessible **Edit hierarchical map** action that opens the full-screen editor for the same chat.
- The edit action is distinct from browsing, centering, or queuing a destination and is available without detouring through Chat Settings.

## Actual behavior

- The Story Location bar is oversized on mobile even though opening and closing it works.
- In portrait, the map editor fills the screen and is usable.
- After rotating to landscape, the header takes nearly the entire screen and the editor becomes unusable.
- The world-map/minimap has browse and center controls but no direct full-screen edit action, so editing names, descriptions, or other location fields requires navigating through Chat Settings.

## Steps to reproduce

1. Run Marinara Engine `2.3.1+8afe4a2857ae` with Hierarchical Maps `1.1.0`.
2. Open a Game campaign with an existing hierarchical map on a real mobile device.
3. Observe and toggle the Story Location bar.
4. Open **Chat Settings -> Hierarchical map -> Edit hierarchical map**.
5. Confirm portrait is usable, then rotate the device to landscape.
6. Observe how much of the landscape viewport remains for the hierarchy, local view, and details.
7. Return to the Game world-map/minimap and confirm there is no button that opens the full-screen editor directly.

## Environment

- Marinara Engine version: `2.3.1+8afe4a2857ae` (candidate commit `8afe4a2857ae5731a494dcc765a20ebfddbfbaef`)
- Package version: Hierarchical Maps `1.1.0` (candidate commit `3b19f15949e039bd7c56b54543ee1a2582770f8e`)
- Install type: source; exact local candidate artifact
- OS + version: real mobile device; exact OS/version was not recorded during sign-off
- Browser or app shell: not recorded during sign-off

## Logs, screenshots, or video

No screenshot or recording was captured. Engine health remained OK, the package reported `ready`, and no server errors were logged during the human test.

## Additional context

This was found during the required Phase 2 real-device mobile/touch sign-off and is a release-sign-off failure. The related Engine-owned problem is that Story Location competes with CYOA, Inventory, and Combat for mobile Game space; that host-layout issue should be tracked in `Pasta-Devs/Marinara-Engine` and linked here after filing.

The candidate boundary currently gives `GameWorldMap` browsing, centering, and destination actions but no `onOpenEditor` capability. Engine's `world-map` host likewise does not pass its existing full-screen editor action into the package contribution. The coordinated fix should expose that host action publicly and render a compact package-owned button on the map itself.

Ownership is currently unassigned; no implementation has started.

## Template check

- [ ] I DID NOT read this template and provide the requested details.

## Human test record

- Package readiness and existing-campaign load: PASS
- Desktop Default Dark, Default Light, and SillyTavern Dark: PASS, light confidence
- Desktop keyboard operation: PASS
- Real-device mobile portrait editor: PASS
- Real-device mobile Story Location/CYOA composition: FAIL
- Real-device mobile landscape editor: FAIL
- Direct full-screen editor access from the world-map/minimap: FAIL
- Controlled client-load failure presentation: PASS
- Client Retry after exact-bundle restoration, without a page reload: PASS
- Missing-package UI after uninstall and restart: PASS
- Exact-artifact reinstall and readiness: PASS
- Human confirmation that the same map and current Story Location returned: PASS
- Stored map definitions: 10 before and after; canonical fingerprint unchanged
- Spatial snapshots: 110 before and after; canonical fingerprint unchanged

Overall Phase 2 human sign-off remains **FAIL** because the real-device mobile Game/CYOA composition and landscape editor defects are release blockers even though package readiness, recovery, and data preservation passed.
