# Personal Extension Architecture

Personal Extensions are disabled-by-default, hash-approved code with two isolated runtimes. Professor Mari drafts are the only extension class available by default. All other sources are External Extensions and require two independent operator gates.

## Security invariants

Keep these properties true:

1. Creation and import always produce a disabled, unapproved draft.
2. Approval requires the exact current `sha256:` content hash and an explicit sandboxed-code acknowledgement.
3. Any executable change disables the extension and clears `approvedHash`.
4. Rollback restores a disabled draft.
5. Backup and profile import clear approval and enabled state.
6. Professor Mari may create and update drafts but has no action that approves or enables them.
7. Every source other than `professor_mari` is external, including `external`, `local`, `legacy`, `profile_import`, and unknown values normalized to `legacy`.
8. External records are absent from management and runtime responses unless `ENABLE_EXTERNAL_EXTENSIONS=true` and the persisted Danger Zone opt-in is also true.
9. Closing either gate disables stored external records and stops active server processes. Browser runtime polling removes active browser workers.
10. Browser code never executes in the Marinara document. Server code never executes in the Marinara server process.
11. There is no URL installer, remote catalog, or automatic updater.

The gates are enforced in routes and runtime services. Hiding controls is not a security boundary. A manually added, restored, legacy, or out-of-band external record must remain invisible and unexecutable while either gate is closed.

## Storage and policy

The `installed_extensions` file table stores metadata, executable code, `contentHash`, `approvedHash`, source, and up to ten prior executable revisions. Private extension settings use `app_settings` keys prefixed with `extension-storage:`. The Danger Zone opt-in uses `external-extensions-enabled`.

Startup runs `preparePersonalExtensionTrust`. A legacy row without a hash is retained but disabled and unapproved. A row whose stored hash no longer matches its executable fields is also disabled and re-fingerprinted.

`personal-extension-policy.service.ts` combines the live `.env` gate with the persisted user opt-in. `personal-extension-storage.service.ts` can disable all non-Professor records. The `.env` watcher reapplies the policy within roughly two seconds and asks the server runtime to stop code when the gate closes.

## API

The management surface is under `/api/personal-extensions`:

- `GET /policy` returns both gate states and server sandbox availability.
- `PATCH /policy/external` changes the Danger Zone opt-in and refuses `true` unless the `.env` gate is open.
- `GET /` lists Professor drafts plus external drafts only when both gates are open.
- `POST /` imports an External Extension and is rejected unless both gates are open.
- `PATCH /:id` edits or disables a draft.
- `POST /:id/approve` approves the exact current hash, applies the external gate, and refuses Server approval without a supported OS sandbox.
- `POST /:id/rollback` restores a prior disabled revision.
- `DELETE /:id` deletes the extension and private settings.

Approved Browser runtime metadata is read from `GET /runtime/client`. The executable document is served by `GET /:id/sandbox.html?hash=...` only while the exact hash is enabled, approved, and allowed by policy.

## Browser runtime

`PersonalExtensionInjector.tsx` creates a hidden iframe with `sandbox="allow-scripts"` and no `allow-same-origin`. The iframe therefore has an opaque origin and cannot access Marinara's DOM, cookies, storage, or same-origin APIs.

The sandbox response replaces the normal page policy with a narrow CSP: no default resources, no connections, no forms, no objects, and no navigation authority. Extension CSS stays inside the hidden iframe. JavaScript runs in a dedicated Worker created by the trusted iframe bootstrap. Network and nested-worker globals are removed as defense in depth.

The worker receives only:

- namespaced logging;
- private extension storage brokered by the parent;
- managed timers;
- cleanup registration;
- a constrained window UI through `marinara.ui.showWindow(...)`.

`marinara.ui.showWindow({ title, elements, onEvent, onClose })` returns a handle with `update({ title?, elements? })` and `close()`. Each element is one of a fixed whitelist — `heading`, `text`, `pre`, `button`, `input`, `spacer` — with plain-string fields; `button` and `input` require an `id`. The worker only sends these descriptors. The trusted iframe bootstrap renders them with `textContent` (never `innerHTML`), so no markup, event handlers, or styles cross from the extension into the rendered DOM. A button click posts `{ windowId, elementId, values }` back to `onEvent`, where `values` maps each input `id` to its current string value. The host reveals the otherwise-hidden sandbox iframe as a centered overlay only while a window is open, and hides it again on close; the extension still has no access to Marinara's DOM, network, or the host window. Window count, element count, and text length are capped, and window messages count toward the same rate limit as everything else.

There is no DOM helper, Marinara API fetch, parent event access, or arbitrary network capability. The iframe validates and rate-limits messages. A heartbeat watchdog terminates an unresponsive or busy-looping worker.

## Server runtime

Server source runs in a separate Node process, never through an in-process import. Node's permission model denies filesystem, network, child-process, worker, native-addon, WASI, and inspector capabilities. The child also runs inside:

- macOS Seatbelt; or
- Linux Bubblewrap with separate PID, network, IPC, and mount namespaces.

The sandbox receives a minimal environment, a small V8 heap, no application files, no server secrets, and bounded line-delimited protocol files inside its private temporary directory. It receives only logging, private extension storage, managed timers, and cleanup registration. Message quotas and a separate heartbeat file contain protocol flooding and busy loops.

Node permissions and `node:vm` are defense-in-depth layers, not the security boundary. The separate OS sandbox is mandatory. Windows, Android, Linux without `bwrap`, and any other unsupported platform refuse to enable Server Extensions.

## Validation

Run:

```bash
pnpm check
pnpm regression:extensions-security
pnpm regression:professor-mari-shell-sandbox
pnpm smoke:ui
```

The security regression must prove the two-step gate, exact-hash invalidation, opaque-origin worker shape, removal of same-origin injection, environment stripping, filesystem/network denial, private storage, and fail-closed sandbox availability.
