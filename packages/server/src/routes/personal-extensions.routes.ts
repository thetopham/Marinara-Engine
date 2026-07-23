import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import {
  approvePersonalExtensionSchema,
  createPersonalExtensionSchema,
  externalExtensionsPolicyUpdateSchema,
  personalExtensionStoragePatchSchema,
  rollbackPersonalExtensionSchema,
  updatePersonalExtensionSchema,
  type PersonalClientExtensionRuntime,
  type PersonalExtension,
} from "@marinara-engine/shared";
import { requirePrivilegedAccess } from "../middleware/privileged-gate.js";
import { createPersonalExtensionsStorage } from "../services/extensions/personal-extension-storage.service.js";
import { createPersonalExtensionSettingsStorage } from "../services/extensions/personal-extension-settings.service.js";
import { createAppSettingsStorage } from "../services/storage/app-settings.storage.js";
import { personalServerExtensionRuntime } from "../services/extensions/personal-server-extension-runtime.js";
import {
  canExecutePersonalExtension,
  getPersonalExtensionPolicy,
  isExternalPersonalExtensionSource,
  setExternalExtensionsEnabled,
} from "../services/extensions/personal-extension-policy.service.js";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function privileged(req: Parameters<typeof requirePrivilegedAccess>[0], reply: Parameters<typeof requirePrivilegedAccess>[1]) {
  return requirePrivilegedAccess(req, reply, { feature: "Personal Extensions" });
}

function escapeClosingTag(source: string, tag: "style") {
  return source.replace(new RegExp(`</${tag}`, "giu"), `<\\/${tag}`);
}

function browserWorkerSource(extension: PersonalExtension) {
  const identity = JSON.stringify({
    id: extension.id,
    name: extension.name,
    contentHash: extension.contentHash,
  });
  return `
(() => {
  "use strict";
  const extension = ${identity};
  const send = self.postMessage.bind(self);
  const cleanupFns = [];
  let requestId = 0;
  const pending = new Map();
  for (const name of ["fetch", "WebSocket", "EventSource", "XMLHttpRequest", "Worker", "SharedWorker", "WebTransport", "importScripts"]) {
    try { Object.defineProperty(self, name, { value: undefined, writable: false, configurable: false }); } catch {}
  }
  const storage = (action, payload) => new Promise((resolve, reject) => {
    const id = String(++requestId);
    pending.set(id, { resolve, reject });
    send({ type: "storage", requestId: id, action, payload });
  });
  const managedTimeout = (fn, ms) => {
    const timer = self.setTimeout(fn, Math.max(0, Math.min(2147483647, Number(ms) || 0)));
    cleanupFns.push(() => self.clearTimeout(timer));
    return timer;
  };
  const managedInterval = (fn, ms) => {
    const timer = self.setInterval(fn, Math.max(1, Math.min(2147483647, Number(ms) || 1)));
    cleanupFns.push(() => self.clearInterval(timer));
    return timer;
  };
  const log = (level, args) => send({ type: "log", level, args: args.map((value) => {
    try { return JSON.parse(JSON.stringify(value)); } catch { return String(value); }
  }) });
  const marinara = Object.freeze({
    runtime: "client",
    version: 2,
    extensionId: extension.id,
    extensionName: extension.name,
    log: Object.freeze({
      debug: (...args) => log("debug", args),
      info: (...args) => log("info", args),
      warn: (...args) => log("warn", args),
      error: (...args) => log("error", args),
    }),
    storage: Object.freeze({
      get: () => storage("get"),
      patch: (patch) => storage("patch", patch),
      delete: () => storage("delete"),
    }),
    setTimeout: managedTimeout,
    setInterval: managedInterval,
    clearTimeout: self.clearTimeout.bind(self),
    clearInterval: self.clearInterval.bind(self),
    onCleanup: (fn) => {
      if (typeof fn !== "function") throw new Error("onCleanup requires a function");
      cleanupFns.push(fn);
    },
  });
  self.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.type === "storage-result") {
      const request = pending.get(message.requestId);
      if (!request) return;
      pending.delete(message.requestId);
      if (message.ok) request.resolve(message.value);
      else request.reject(new Error(message.error || "Extension storage request failed"));
    }
    if (message?.type === "stop") {
      for (const cleanup of [...cleanupFns].reverse()) {
        try { cleanup(); } catch {}
      }
      cleanupFns.length = 0;
      send({ type: "stopped" });
      self.close();
    }
  });
  self.setInterval(() => send({ type: "heartbeat" }), 1_000);
  Promise.resolve((async () => {
    "use strict";
${extension.js ?? ""}
  })()).then(
    () => send({ type: "ready", contentHash: extension.contentHash }),
    (error) => send({ type: "error", contentHash: extension.contentHash, message: error instanceof Error ? error.message : String(error) }),
  );
})();
`;
}

function sandboxDocument(extension: PersonalExtension, nonce: string) {
  const boot = JSON.stringify({
    id: extension.id,
    name: extension.name,
    contentHash: extension.contentHash,
    workerSource: browserWorkerSource(extension),
  }).replace(/</gu, "\\u003c");
  const css = escapeClosingTag(extension.css ?? "", "style");
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<style>${css}</style>
</head>
<body>
<script nonce="${nonce}">
(() => {
  "use strict";
  const extension = ${boot};
  const post = (message) => window.parent.postMessage({ channel: "marinara-personal-extension", ...message }, "*");
  const workerUrl = URL.createObjectURL(new Blob([extension.workerSource], { type: "text/javascript" }));
  const worker = new Worker(workerUrl);
  URL.revokeObjectURL(workerUrl);
  let lastHeartbeat = Date.now();
  let stopped = false;
  let messageWindowStartedAt = Date.now();
  let messageCount = 0;
  worker.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.type === "heartbeat") {
      lastHeartbeat = Date.now();
      return;
    }
    if (Date.now() - messageWindowStartedAt > 10_000) {
      messageWindowStartedAt = Date.now();
      messageCount = 0;
    }
    messageCount += 1;
    if (messageCount > 200) {
      stopped = true;
      worker.terminate();
      window.clearInterval(watchdog);
      post({ type: "error", contentHash: extension.contentHash, message: "Browser extension was stopped for exceeding the sandbox message limit" });
      return;
    }
    if (message?.type === "storage") {
      let payloadSize = 0;
      try { payloadSize = new TextEncoder().encode(JSON.stringify(message.payload ?? null)).byteLength; } catch { payloadSize = 1_000_001; }
      if (!["get", "patch", "delete"].includes(message.action) || payloadSize > 1_000_000) {
        worker.postMessage({
          type: "storage-result",
          requestId: message.requestId,
          ok: false,
          error: "Storage request was rejected by the sandbox",
        });
        return;
      }
    }
    if (message?.type === "storage" || message?.type === "log" || message?.type === "ready" || message?.type === "error") {
      post(message);
    }
  });
  worker.addEventListener("error", (event) => {
    post({ type: "error", contentHash: extension.contentHash, message: event.message || "Browser extension worker failed" });
  });
  const watchdog = window.setInterval(() => {
    if (stopped || Date.now() - lastHeartbeat <= 5_000) return;
    stopped = true;
    worker.terminate();
    window.clearInterval(watchdog);
    post({ type: "error", contentHash: extension.contentHash, message: "Browser extension was stopped because its sandbox became unresponsive" });
  }, 1_000);
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.data?.channel !== "marinara-personal-extension") return;
    const message = event.data;
    if (message.type === "storage-result") worker.postMessage(message);
    if (message.type === "stop") {
      stopped = true;
      window.clearInterval(watchdog);
      worker.postMessage({ type: "stop" });
      window.setTimeout(() => worker.terminate(), 500);
    }
  });
})();
</script>
</body>
</html>`;
}

export async function personalExtensionsRoutes(app: FastifyInstance) {
  const storage = createPersonalExtensionsStorage(app.db);
  const settings = createPersonalExtensionSettingsStorage(createAppSettingsStorage(app.db));

  app.get("/policy", async () => getPersonalExtensionPolicy(app.db));

  app.patch("/policy/external", async (req, reply) => {
    if (!privileged(req, reply)) return;
    const input = externalExtensionsPolicyUpdateSchema.parse(req.body);
    if (input.enabled && !(await getPersonalExtensionPolicy(app.db)).externalExtensionsEnvEnabled) {
      return reply.status(409).send({
        error: "External Extensions are locked. Set ENABLE_EXTERNAL_EXTENSIONS=true in .env first.",
      });
    }
    const policy = await setExternalExtensionsEnabled(app.db, input.enabled);
    if (!policy.externalExtensionsEnabled) await storage.disableExternal();
    await personalServerExtensionRuntime.enforceExternalPolicy();
    return policy;
  });

  app.get("/", async (req, reply) => {
    if (!privileged(req, reply)) return;
    const policy = await getPersonalExtensionPolicy(app.db);
    return (await storage.list())
      .filter((extension) => canExecutePersonalExtension(extension, policy))
      .map((extension) => personalServerExtensionRuntime.withRuntimeStatus(extension));
  });

  app.get("/runtime/client", async (): Promise<PersonalClientExtensionRuntime[]> => {
    const policy = await getPersonalExtensionPolicy(app.db);
    const extensions = await storage.list();
    return extensions
      .filter(
        (extension) =>
          extension.runtime === "client" &&
          extension.enabled &&
          extension.approvedHash === extension.contentHash &&
          canExecutePersonalExtension(extension, policy),
      )
      .map((extension) => ({
        id: extension.id,
        name: extension.name,
        description: extension.description,
        contentHash: extension.contentHash,
        sandboxUrl: `/api/personal-extensions/${encodeURIComponent(extension.id)}/sandbox.html?hash=${encodeURIComponent(extension.contentHash)}`,
      }));
  });

  app.get<{ Params: { id: string }; Querystring: { hash?: string } }>("/:id/sandbox.html", async (req, reply) => {
    if (!ID_PATTERN.test(req.params.id)) return reply.status(404).send("Not Found");
    const policy = await getPersonalExtensionPolicy(app.db);
    const extension = await storage.getById(req.params.id);
    if (
      !extension ||
      extension.runtime !== "client" ||
      !extension.enabled ||
      extension.approvedHash !== extension.contentHash ||
      req.query.hash !== extension.contentHash ||
      !canExecutePersonalExtension(extension, policy)
    ) {
      return reply.status(404).send("Not Found");
    }
    const nonce = randomBytes(18).toString("base64");
    reply.type("text/html; charset=utf-8");
    reply.header("Cache-Control", "no-store");
    reply.header("X-Frame-Options", "SAMEORIGIN");
    reply.header(
      "Content-Security-Policy",
      `default-src 'none'; script-src 'nonce-${nonce}'; worker-src blob:; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'`,
    );
    return sandboxDocument(extension, nonce);
  });

  app.post("/", async (req, reply) => {
    if (!privileged(req, reply)) return;
    const policy = await getPersonalExtensionPolicy(app.db);
    if (!policy.externalExtensionsEnabled) {
      return reply.status(403).send({
        error: "External Extension imports require both ENABLE_EXTERNAL_EXTENSIONS=true and the Danger Zone opt-in.",
      });
    }
    const input = createPersonalExtensionSchema.parse(req.body);
    const existing = await storage.getByName(input.name);
    if (existing) {
      return reply.status(409).send({ error: `A Personal Extension named "${input.name}" already exists`, id: existing.id });
    }
    return storage.create(input, { source: "external" });
  });

  app.patch<{ Params: { id: string } }>("/:id", async (req, reply) => {
    if (!privileged(req, reply)) return;
    if (!ID_PATTERN.test(req.params.id)) return reply.status(404).send({ error: "Personal Extension not found" });
    const input = updatePersonalExtensionSchema.parse(req.body);
    const existing = await storage.getById(req.params.id);
    if (!existing) return reply.status(404).send({ error: "Personal Extension not found" });
    const updated = input.enabled === false ? await storage.disable(req.params.id) : await storage.update(req.params.id, input);
    if (existing.runtime === "server" || updated?.runtime === "server") {
      await personalServerExtensionRuntime.reloadExtension(req.params.id);
    }
    return updated;
  });

  app.post<{ Params: { id: string } }>("/:id/approve", async (req, reply) => {
    if (!privileged(req, reply)) return;
    if (!ID_PATTERN.test(req.params.id)) return reply.status(404).send({ error: "Personal Extension not found" });
    const input = approvePersonalExtensionSchema.parse(req.body);
    const existing = await storage.getById(req.params.id);
    if (!existing) return reply.status(404).send({ error: "Personal Extension not found" });
    const policy = await getPersonalExtensionPolicy(app.db);
    if (isExternalPersonalExtensionSource(existing.source) && !policy.externalExtensionsEnabled) {
      return reply.status(403).send({ error: "External Extensions are locked by the two-step safety gate." });
    }
    if (existing.runtime === "server" && !policy.serverSandboxAvailable) {
      return reply.status(503).send({ error: policy.serverSandboxReason ?? "No supported server sandbox is available." });
    }
    const approved = await storage.approve(req.params.id, input.contentHash);
    if (!approved) return reply.status(404).send({ error: "Personal Extension not found" });
    if (approved.runtime === "server") await personalServerExtensionRuntime.reloadExtension(approved.id);
    return personalServerExtensionRuntime.withRuntimeStatus(approved);
  });

  app.post<{ Params: { id: string } }>("/:id/rollback", async (req, reply) => {
    if (!privileged(req, reply)) return;
    if (!ID_PATTERN.test(req.params.id)) return reply.status(404).send({ error: "Personal Extension not found" });
    const input = rollbackPersonalExtensionSchema.parse(req.body);
    const existing = await storage.getById(req.params.id);
    if (!existing) return reply.status(404).send({ error: "Personal Extension not found" });
    const rolledBack = await storage.rollback(req.params.id, input.contentHash);
    if (existing.runtime === "server" || rolledBack?.runtime === "server") {
      await personalServerExtensionRuntime.reloadExtension(req.params.id);
    }
    return rolledBack;
  });

  const browserStorageExtension = async (id: string) => {
    const extension = ID_PATTERN.test(id) ? await storage.getById(id) : null;
    if (
      !extension ||
      extension.runtime !== "client" ||
      !extension.enabled ||
      extension.approvedHash !== extension.contentHash ||
      !canExecutePersonalExtension(extension, await getPersonalExtensionPolicy(app.db))
    ) {
      return null;
    }
    return extension;
  };

  app.get<{ Params: { id: string } }>("/:id/storage", async (req, reply) => {
    const extension = await browserStorageExtension(req.params.id);
    if (!extension) return reply.status(404).send({ error: "Personal Extension not found" });
    return { value: await settings.get(extension.id) };
  });

  app.patch<{ Params: { id: string } }>("/:id/storage", async (req, reply) => {
    const extension = await browserStorageExtension(req.params.id);
    if (!extension) return reply.status(404).send({ error: "Personal Extension not found" });
    const patch = personalExtensionStoragePatchSchema.parse(req.body ?? {});
    return { value: await settings.patch(extension.id, patch) };
  });

  app.delete<{ Params: { id: string } }>("/:id/storage", async (req, reply) => {
    const extension = await browserStorageExtension(req.params.id);
    if (!extension) return reply.status(404).send({ error: "Personal Extension not found" });
    await settings.remove(extension.id);
    return { value: {} };
  });

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    if (!privileged(req, reply)) return;
    if (!ID_PATTERN.test(req.params.id)) return reply.status(404).send({ error: "Personal Extension not found" });
    const existing = await storage.getById(req.params.id);
    if (!existing) return reply.status(404).send({ error: "Personal Extension not found" });
    await settings.remove(existing.id);
    await storage.remove(existing.id);
    if (existing.runtime === "server") await personalServerExtensionRuntime.unloadExtension(existing.id);
    return reply.status(204).send();
  });
}
