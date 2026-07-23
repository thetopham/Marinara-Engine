import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LATEST_RELEASE_URL,
  checkForLauncherUpdate,
  getVersionFromReleaseUrl,
  isNewerStableVersion,
} from "../check-launcher-update.mjs";
import {
  resolveLauncherDataDir,
  restoreLauncherDataIfMissing,
  snapshotLauncherData,
} from "../protect-launcher-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const releaseUrl = "https://github.com/Pasta-Devs/Marinara-Engine/releases/tag/v2.3.4";

assert.equal(getVersionFromReleaseUrl(releaseUrl), "2.3.4");
assert.equal(getVersionFromReleaseUrl(LATEST_RELEASE_URL), null);
assert.equal(getVersionFromReleaseUrl("https://example.com/releases/tag/v9.9.9"), null);
assert.equal(isNewerStableVersion("2.3.3", "2.3.4"), true);
assert.equal(isNewerStableVersion("2.3.4", "2.3.4"), false);
assert.equal(isNewerStableVersion("2.4.0", "2.3.4"), false);
assert.equal(isNewerStableVersion("development", "2.3.4"), false);

const reminder = await checkForLauncherUpdate({
  currentVersion: "2.3.3",
  fetchImpl: async (url, options) => {
    assert.equal(url, LATEST_RELEASE_URL);
    assert.equal(options.method, "HEAD");
    assert.equal(options.redirect, "follow");
    return { ok: true, url: releaseUrl };
  },
});
assert.match(reminder, /Marinara Engine v2\.3\.4 is available/);
assert.match(reminder, /installed: v2\.3\.3/);
assert.match(reminder, /Automatic updates are disabled/);
assert.match(reminder, new RegExp(releaseUrl.replaceAll(".", "\\.")));

const currentReminder = await checkForLauncherUpdate({
  currentVersion: "2.3.4",
  fetchImpl: async () => ({ ok: true, url: releaseUrl }),
});
assert.equal(currentReminder, null);

const unavailableReminder = await checkForLauncherUpdate({
  currentVersion: "2.3.3",
  fetchImpl: async () => ({ ok: false, url: LATEST_RELEASE_URL }),
});
assert.equal(unavailableReminder, null);

function assertPosixReminderRouting(launcherName) {
  const launcherSource = readFileSync(join(repositoryRoot, launcherName), "utf8");
  const updateBlockStart = launcherSource.indexOf("# ── Auto-update from Git ──");
  assert.notEqual(updateBlockStart, -1, `${launcherName} must define its update decision block`);

  const updateBlock = launcherSource.slice(updateBlockStart);
  const skipBranch = updateBlock.indexOf('if [ "$SKIP_UPDATE" = "1" ]; then');
  const disabledBranch = updateBlock.indexOf('elif [ "$AUTO_UPDATE_DISABLED" = "1" ]; then');
  const reminderInvocation = updateBlock.indexOf("node scripts/check-launcher-update.mjs");
  const enabledUpdateBranch = updateBlock.indexOf('elif [ -d ".git" ]; then');

  assert.ok(skipBranch >= 0, `${launcherName} must handle --skip-update first`);
  assert.ok(disabledBranch > skipBranch, `${launcherName} must keep the reminder after --skip-update`);
  assert.ok(
    reminderInvocation > disabledBranch,
    `${launcherName} must invoke the reminder only after automatic updates are found disabled`,
  );
  assert.ok(
    enabledUpdateBranch > reminderInvocation,
    `${launcherName} must keep the reminder out of the automatic-update-enabled branch`,
  );
  assert.equal(
    updateBlock.match(/node scripts\/check-launcher-update\.mjs/gu)?.length,
    1,
    `${launcherName} must have exactly one reminder invocation`,
  );
}

assertPosixReminderRouting("start.sh");
assertPosixReminderRouting("start-termux.sh");

const windowsLauncherSource = readFileSync(join(repositoryRoot, "start.bat"), "utf8");
assert.match(windowsLauncherSource, /check-launcher-update\.mjs/u);

for (const launcherName of ["start.sh", "start-termux.sh", "start.bat"]) {
  const launcherSource = readFileSync(join(repositoryRoot, launcherName), "utf8");
  assert.doesNotMatch(launcherSource, /pnpm install --force/u, `${launcherName} must not force dependency reinstalls`);
  assert.match(launcherSource, /install --frozen-lockfile --prefer-offline/u);
  assert.match(launcherSource, /protect-launcher-data\.mjs snapshot/u);
  assert.match(launcherSource, /protect-launcher-data\.mjs restore-if-missing/u);
}

const fixtureRoot = mkdtempSync(join(tmpdir(), "marinara-launcher-data-"));
const fixtureBackupRoot = resolve(fixtureRoot, "..", `${basename(fixtureRoot)}-backups`);
try {
  const defaultDataDir = await resolveLauncherDataDir({ root: fixtureRoot, env: {} });
  mkdirSync(defaultDataDir, { recursive: true });
  writeFileSync(join(defaultDataDir, "characters.json"), '{"name":"Preserved"}\n');

  const snapshot = await snapshotLauncherData({
    root: fixtureRoot,
    backupRoot: fixtureBackupRoot,
    env: {},
    now: new Date("2026-07-23T12:00:00.000Z"),
  });
  assert.equal(snapshot.created, true);

  rmSync(defaultDataDir, { recursive: true, force: true });
  const restore = await restoreLauncherDataIfMissing({ root: fixtureRoot, backupRoot: fixtureBackupRoot, env: {} });
  assert.equal(restore.restored, true);
  assert.equal(readFileSync(join(defaultDataDir, "characters.json"), "utf8"), '{"name":"Preserved"}\n');

  writeFileSync(join(fixtureRoot, ".env"), "DATA_DIR=../custom-data\n");
  assert.equal(
    await resolveLauncherDataDir({ root: fixtureRoot, env: {} }),
    resolve(fixtureRoot, "packages/server", "../custom-data"),
  );
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
  rmSync(fixtureBackupRoot, { recursive: true, force: true });
}

console.log("Launcher update reminder regressions passed.");
