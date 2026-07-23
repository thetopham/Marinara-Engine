# Personal Extensions

Personal Extensions let you keep private CSS or JavaScript customizations inside Marinara Engine without publishing them to a catalog. Use them for code you wrote yourself, code you inspected locally, or a draft Professor Mari created for you.

Open **Settings** > **Addons** > **Personal Extensions**.

## The trust model

Personal Extensions are local and full-trust:

- Marinara never downloads or automatically updates them.
- A new import or draft always starts disabled.
- Marinara fingerprints the exact executable code with SHA-256.
- Choosing **Review and Run** approves only the fingerprint currently shown.
- Editing executable code, importing an update, restoring a revision, or changing its runtime disables the extension and clears approval.
- Profile exports and imports never transfer execution approval.

This protects the approval step from changing underneath you. It does not make untrusted code safe.

A **Browser** extension runs on Marinara's browser origin. It can read and change anything available to that signed-in browser session, including chats and settings. A **Server** extension runs as trusted application code inside the Marinara server process. It can access the server's files, environment, network, and data. Only run code you understand and trust completely.

## Create a Personal Extension

1. Open **Settings** > **Addons**.
2. In **Personal Extensions**, choose **New Draft**.
3. Enter a name and optional version and description.
4. Choose **Browser** or **Server**.
5. Add the code.
6. Choose **Save Draft**.
7. Read the warning and review the code and fingerprint.
8. Choose **Review and Run**, then confirm **Run Exact Code**.

Browser extensions may contain sanitized CSS, JavaScript, or both. Server extensions require JavaScript.

## Ask Professor Mari

You can ask Professor Mari to create or revise a Personal Extension. She saves the result as a disabled draft and can never approve or enable it. Open the draft in **Settings** > **Addons**, inspect the exact code, and approve its fingerprint yourself.

Professor Mari's raw shell commands use an operating-system sandbox. Network access is denied, inherited server secrets are removed, and filesystem writes are confined to the Marinara workspace. If a supported sandbox is unavailable, raw shell commands are disabled rather than falling back to an unrestricted shell.

## Import and export

Choose **Import Local File** or **Import Local Folder** to import code from your device. Supported formats include:

- `.personal-extension.zip` and compatible `.zip` packages
- `.json` manifests
- `.css`
- `.js`, `.mjs`, and `.cjs`
- `.server.js`, `.server.mjs`, and `.server.cjs`

Older Marinara extension packages can be imported for recovery. Any `enabled` value inside a manifest is ignored.

Use an extension's **Export local package** action to download a portable package. Exported packages are disabled by design, so importing one on another Marinara server requires a fresh review.

## Updates and revision history

Personal Extensions have no remote updater. To update one, edit its draft, import a new local package with the same name, or ask Professor Mari to revise it.

Executable changes save the previous code in **Revision History**. Restoring an older revision returns it as a disabled draft. Review and approve that revision again before it runs.

## Remote devices

You can use Personal Extensions from another device connected to the same Marinara server. Management actions require Admin Access when the remote browser is not already trusted for privileged actions. Set the Admin Access secret in **Settings** > **Advanced**, following [Remote Access](../REMOTE_ACCESS.md).

An approved Browser extension runs separately in each browser that opens Marinara. A Server extension runs once in the Marinara server process.

## If an extension misbehaves

Open **Settings** > **Addons** and choose **Disable**. If the extension prevents the interface from loading, stop Marinara and edit the `installed_extensions` storage record only as a recovery measure, setting `enabled` to `"false"`. Do not set `approvedHash` by hand.

For server extensions, the list shows startup errors. Fix the draft, save it, and approve the new fingerprint only after reviewing the correction.

## Related guides

- [Professor Mari](../home/professor-mari.md)
- [Custom CSS Themes](../appearance/custom-css-themes.md)
- [Backup and Restore](../data/backup-and-restore.md)
- [Remote Access](../REMOTE_ACCESS.md)
