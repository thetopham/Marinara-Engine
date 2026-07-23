import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPersonalExtensionSchema } from "../../packages/shared/src/schemas/personal-extension.schema.js";
import type { DB } from "../../packages/server/src/db/connection.js";
import { createFileNativeDB } from "../../packages/server/src/db/file-backed-store.js";
import { appSettings, installedExtensions } from "../../packages/server/src/db/schema/index.js";
import { createPersonalExtensionSettingsStorage } from "../../packages/server/src/services/extensions/personal-extension-settings.service.js";
import { createPersonalExtensionsStorage } from "../../packages/server/src/services/extensions/personal-extension-storage.service.js";
import { PersonalServerExtensionRuntime } from "../../packages/server/src/services/extensions/personal-server-extension-runtime.js";
import { getMariDbService } from "../../packages/server/src/services/mari-db/mari-db.service.js";
import { preparePersonalExtensionTrust } from "../../packages/server/src/services/setup/personal-extension-trust.js";
import { createAppSettingsStorage } from "../../packages/server/src/services/storage/app-settings.storage.js";

const clientInjectorSource = readFileSync(
  new URL("../../packages/client/src/components/layout/PersonalExtensionInjector.tsx", import.meta.url),
  "utf8",
);
const clientAppSource = readFileSync(new URL("../../packages/client/src/App.tsx", import.meta.url), "utf8");
const clientSettingsSource = readFileSync(
  new URL("../../packages/client/src/components/panels/settings/PersonalExtensionsSettings.tsx", import.meta.url),
  "utf8",
);
const routeIndexSource = readFileSync(new URL("../../packages/server/src/routes/index.ts", import.meta.url), "utf8");
const extensionRoutesSource = readFileSync(
  new URL("../../packages/server/src/routes/personal-extensions.routes.ts", import.meta.url),
  "utf8",
);
const extensionSchemaSource = readFileSync(
  new URL("../../packages/shared/src/schemas/personal-extension.schema.ts", import.meta.url),
  "utf8",
);
const backupSource = readFileSync(new URL("../../packages/server/src/routes/backup.routes.ts", import.meta.url), "utf8");
const securityHeadersSource = readFileSync(
  new URL("../../packages/server/src/middleware/security-headers.ts", import.meta.url),
  "utf8",
);
const professorMariSource = readFileSync(
  new URL("../../packages/server/src/services/professor-mari/workspace-agent.service.ts", import.meta.url),
  "utf8",
);

assert.match(clientAppSource, /PersonalExtensionInjector/u);
assert.match(clientSettingsSource, /Nothing runs until you approve its exact code hash/u);
assert.match(clientSettingsSource, /Review and Run/u);
assert.match(routeIndexSource, /personalExtensionsRoutes/u);
assert.match(extensionSchemaSource, /acknowledgeFullTrust:\s*z\.literal\(true\)/u);
assert.match(extensionRoutesSource, /approvedHash !== extension\.contentHash/u);
assert.match(clientInjectorSource, /\/api\/personal-extensions\/\$\{encodeURIComponent\(extension\.id\)\}\/runtime\.js/u);
assert.doesNotMatch(clientInjectorSource, /createObjectURL|blob:|eval\(|new Function/u);
assert.doesNotMatch(securityHeadersSource, /script-src[^"\n]*\bblob:/u);
assert.match(backupSource, /quarantineProfilePersonalExtensionRow/u);
assert.match(backupSource, /approvedHash: null/u);
assert.match(backupSource, /personalServerExtensionRuntime\.reloadAll\(\)/u);
assert.match(professorMariSource, /Never claim to approve, enable, or run an extension/u);
assert.doesNotMatch(professorMariSource, /personal_extension\.approve|personal_extension\.enable/u);

const manifestWithEnabled = createPersonalExtensionSchema.parse({
  name: "Manifest tries to self-enable",
  runtime: "client",
  js: "globalThis.__manifestShouldNotRun = true;",
  enabled: true,
});
assert.equal("enabled" in manifestWithEnabled, false);

const storageDir = mkdtempSync(join(tmpdir(), "marinara-personal-extension-security-"));
process.env.FILE_STORAGE_DIR = storageDir;
const fileDb = await createFileNativeDB();
const db = fileDb as unknown as DB;
try {
  const timestamp = new Date(0).toISOString();
  await db.insert(installedExtensions).values({
    id: "legacy-local-extension",
    name: "Legacy local extension",
    description: "Regression fixture",
    runtime: "client",
    css: null,
    js: "globalThis.__legacyShouldWaitForApproval = true;",
    serverJs: null,
    enabled: "true",
    installedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(appSettings).values({
    key: "extension-storage:legacy-local-extension",
    value: '{"kept":true}',
    updatedAt: timestamp,
  });

  const migration = await preparePersonalExtensionTrust(db);
  assert.deepEqual(migration, { legacyRecordsQuarantined: 1, changedRecordsDisabled: 0 });
  const migratedRows = await db.select().from(installedExtensions);
  assert.equal(migratedRows.length, 1);
  assert.equal(migratedRows[0]!.enabled, "false");
  assert.match(migratedRows[0]!.contentHash, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(migratedRows[0]!.approvedHash, null);
  assert.equal(migratedRows[0]!.source, "legacy");
  assert.equal((await db.select().from(appSettings))[0]!.value, '{"kept":true}');

  const storage = createPersonalExtensionsStorage(db);
  const created = await storage.create({
    name: "Local Clock",
    version: "1.0.0",
    description: "Regression fixture",
    runtime: "client",
    css: null,
    js: "marinara.onCleanup(() => undefined);",
    serverJs: null,
  });
  assert.ok(created);
  assert.equal(created.enabled, false);
  assert.equal(created.approvedHash, null);

  await assert.rejects(
    storage.approve(created.id, migratedRows[0]!.contentHash),
    /content changed before approval/i,
  );
  const approved = await storage.approve(created.id, created.contentHash);
  assert.ok(approved);
  assert.equal(approved.enabled, true);
  assert.equal(approved.approvedHash, approved.contentHash);

  const updated = await storage.update(created.id, {
    js: "marinara.onCleanup(() => console.info('updated'));",
  });
  assert.ok(updated);
  assert.notEqual(updated.contentHash, approved.contentHash);
  assert.equal(updated.enabled, false);
  assert.equal(updated.approvedHash, null);
  assert.equal(updated.revisions[0]?.contentHash, approved.contentHash);
  await assert.rejects(storage.approve(created.id, approved.contentHash), /content changed before approval/i);

  const rolledBack = await storage.rollback(created.id, approved.contentHash);
  assert.ok(rolledBack);
  assert.equal(rolledBack.contentHash, approved.contentHash);
  assert.equal(rolledBack.enabled, false);
  assert.equal(rolledBack.approvedHash, null);

  const serverDraft = await storage.create({
    name: "Trusted local server draft",
    runtime: "server",
    serverJs:
      "await marinara.storage.patch({ started: true }); marinara.onCleanup(async () => { await marinara.storage.patch({ stopped: true }); });",
  });
  assert.ok(serverDraft);
  const approvedServer = await storage.approve(serverDraft.id, serverDraft.contentHash);
  assert.ok(approvedServer?.enabled);
  const serverRuntime = new PersonalServerExtensionRuntime(join(storageDir, "runtime-proof"));
  const extensionSettings = createPersonalExtensionSettingsStorage(createAppSettingsStorage(db));
  await serverRuntime.start(db);
  assert.equal(serverRuntime.withRuntimeStatus(approvedServer).serverStatus, "running");
  assert.deepEqual(await extensionSettings.get(serverDraft.id), { started: true });
  await serverRuntime.stop();
  assert.deepEqual(await extensionSettings.get(serverDraft.id), { started: true, stopped: true });

  const mariDb = getMariDbService(db);
  const mariCreate = await mariDb.executeAction({
    action: "personal_extension.create",
    data: {
      name: "Professor Mari draft",
      runtime: "client",
      js: "marinara.addElement(document.body, 'div', { textContent: 'draft' });",
    },
    apply: true,
    sessionId: "personal-extension-regression",
  });
  assert.equal(mariCreate.ok, true, JSON.stringify(mariCreate));
  const mariDraft = await storage.getByName("Professor Mari draft");
  assert.ok(mariDraft);
  assert.equal(mariDraft.source, "professor_mari");
  assert.equal(mariDraft.enabled, false);
  assert.equal(mariDraft.approvedHash, null);

  const mariUpdate = await mariDb.executeAction({
    action: "personal_extension.update",
    extensionId: mariDraft.id,
    patch: { js: "marinara.addElement(document.body, 'div', { textContent: 'revised draft' });" },
    apply: true,
    sessionId: "personal-extension-regression",
  });
  assert.equal(mariUpdate.ok, true);
  assert.equal((await storage.getById(mariDraft.id))?.enabled, false);
  if (mariUpdate.approval?.status === "pending") {
    await mariDb.restoreAppliedReview(mariUpdate.approval.id);
  }

  const forbiddenMariApproval = await mariDb.executeAction({
    action: "personal_extension.approve",
    extensionId: mariDraft.id,
    apply: true,
    sessionId: "personal-extension-regression",
  });
  assert.equal(forbiddenMariApproval.ok, false);

  const rawApprovalAttempt = await mariDb.executeCli({
    argv: [
      "db",
      "patch",
      "installed_extensions",
      mariDraft.id,
      "--json",
      JSON.stringify({ enabled: "true", approvedHash: mariDraft.contentHash }),
      "--apply",
    ],
    command: "mari db patch installed_extensions <id> --json <approval> --apply",
    sessionId: "personal-extension-regression",
  });
  assert.equal(rawApprovalAttempt.ok, false);
  assert.match(
    JSON.stringify(rawApprovalAttempt.validation),
    /cannot mutate Personal Extensions through raw DB actions/u,
  );

  const repeatedMigration = await preparePersonalExtensionTrust(db);
  assert.deepEqual(repeatedMigration, { legacyRecordsQuarantined: 0, changedRecordsDisabled: 0 });
} finally {
  await fileDb._fileStore.close();
  rmSync(storageDir, { recursive: true, force: true });
}

console.log("Personal Extension trust regression passed.");
