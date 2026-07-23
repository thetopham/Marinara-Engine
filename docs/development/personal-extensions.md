# Personal Extension Architecture

Personal Extensions are a local-only, hash-approved escape hatch for trusted user code. They are intentionally separate from downloadable capability packages and custom themes.

## Invariants

Keep these properties true:

1. Creation and import always produce a disabled, unapproved draft.
2. Approval requires the exact current `sha256:` content hash and an explicit full-trust acknowledgement.
3. Any executable change disables the extension and clears `approvedHash`.
4. Rollback restores a disabled draft.
5. Backup export and profile import clear approval and enabled state.
6. Professor Mari may create and update drafts but has no action that approves or enables them.
7. Browser JavaScript loads from a same-origin script endpoint. Do not add `blob:`, `unsafe-eval`, `eval`, or `new Function`.
8. There is no URL installer, remote catalog, or automatic updater.

## Storage

The `installed_extensions` file table stores metadata, executable code, the current `contentHash`, `approvedHash`, source, and up to ten prior executable revisions. Private extension settings use `app_settings` keys prefixed with `extension-storage:`.

Startup runs `preparePersonalExtensionTrust`. A legacy row without a hash is retained but disabled and unapproved. A row whose stored hash no longer matches its executable fields is also disabled and re-fingerprinted. This catches out-of-band storage edits.

The hash covers a stable JSON tuple of runtime, CSS, browser JavaScript, and server JavaScript. Metadata such as name and description does not affect execution approval.

## API

The privileged management surface is under `/api/personal-extensions`:

- `GET /` lists drafts and runtime state.
- `POST /` creates a disabled draft.
- `PATCH /:id` edits or disables a draft.
- `POST /:id/approve` approves the exact current hash.
- `POST /:id/rollback` restores a prior disabled revision.
- `DELETE /:id` deletes the extension and its private settings.

Approved browser runtime metadata is read from `GET /runtime/client`. Executable JavaScript is served from `GET /:id/runtime.js?hash=...` only while the requested hash is still both enabled and approved.

The per-extension storage endpoints work only for a currently enabled and approved extension.

## Browser runtime

`PersonalExtensionInjector.tsx` injects sanitized CSS and same-origin JavaScript. The route wraps user source in an async function receiving a frozen convenience object named `marinara`.

The helper provides cleanup-aware DOM, event, timer, observer, API, and private-storage utilities. These are conveniences, not a security boundary. Browser code retains the authority of ordinary same-origin JavaScript.

Cleanup runs when an extension is disabled, its hash changes, or the client unmounts. Extension authors should register cleanup for state not created through a managed helper.

## Server runtime

Approved server source is materialized as a mode-`0600` module under the resolved data directory and imported into the server process. It receives a frozen helper for logging, bounded SSRF-aware fetch, private storage, timers, and cleanup.

This runtime is deliberately not a sandbox. A Server Personal Extension is equivalent to trusted local application code and has the authority of the Marinara server process. The UI must preserve that warning.

## Professor Mari

Structured `personal_extension.list|get|search|create|update` actions live in `mari-db.service.ts`. Create and executable update actions set `enabled` to `"false"` and clear approval. Applied-review restore also reloads the server extension runtime so previously approved code cannot remain active after a draft edit.

Raw shell commands are separate. `workspace-shell-sandbox.ts` uses macOS Seatbelt or Linux Bubblewrap, removes inherited secrets, denies outbound network, confines writes to the workspace and a private temporary directory, and fails closed when no supported sandbox exists.

## Validation

Run:

```bash
pnpm check
pnpm regression:extensions-security
pnpm regression:professor-mari-shell-sandbox
pnpm smoke:ui
```

The UI smoke flow covers exact-code approval and invalidation on desktop and mobile.
