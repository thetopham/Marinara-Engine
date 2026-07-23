import type { FastifyInstance } from "fastify";
import {
  approvePersonalExtensionSchema,
  createPersonalExtensionSchema,
  personalExtensionStoragePatchSchema,
  rollbackPersonalExtensionSchema,
  updatePersonalExtensionSchema,
  type PersonalClientExtensionRuntime,
} from "@marinara-engine/shared";
import { requirePrivilegedAccess } from "../middleware/privileged-gate.js";
import { createPersonalExtensionsStorage } from "../services/extensions/personal-extension-storage.service.js";
import { createPersonalExtensionSettingsStorage } from "../services/extensions/personal-extension-settings.service.js";
import { createAppSettingsStorage } from "../services/storage/app-settings.storage.js";
import { personalServerExtensionRuntime } from "../services/extensions/personal-server-extension-runtime.js";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function privileged(req: Parameters<typeof requirePrivilegedAccess>[0], reply: Parameters<typeof requirePrivilegedAccess>[1]) {
  return requirePrivilegedAccess(req, reply, { feature: "Personal Extensions" });
}

function javascriptResponse(id: string, hash: string, name: string, source: string) {
  return [
    "globalThis.__marinaraRunPersonalExtension?.(",
    `  ${JSON.stringify(id)},`,
    `  ${JSON.stringify(hash)},`,
    `  ${JSON.stringify(name)},`,
    "  async function personalExtensionMain(marinara) {",
    '    "use strict";',
    source,
    "  },",
    ");",
    `//# sourceURL=marinara-personal-extension-${id}.js`,
    "",
  ].join("\n");
}

export async function personalExtensionsRoutes(app: FastifyInstance) {
  const storage = createPersonalExtensionsStorage(app.db);
  const settings = createPersonalExtensionSettingsStorage(createAppSettingsStorage(app.db));

  app.get("/", async (req, reply) => {
    if (!privileged(req, reply)) return;
    return (await storage.list()).map((extension) => personalServerExtensionRuntime.withRuntimeStatus(extension));
  });

  app.get("/runtime/client", async (): Promise<PersonalClientExtensionRuntime[]> => {
    const extensions = await storage.list();
    return extensions
      .filter(
        (extension) =>
          extension.runtime === "client" &&
          extension.enabled &&
          extension.approvedHash === extension.contentHash,
      )
      .map((extension) => ({
        id: extension.id,
        name: extension.name,
        description: extension.description,
        contentHash: extension.contentHash,
        css: extension.css,
        hasJavaScript: Boolean(extension.js?.trim()),
      }));
  });

  app.get<{ Params: { id: string }; Querystring: { hash?: string } }>("/:id/runtime.js", async (req, reply) => {
    if (!ID_PATTERN.test(req.params.id)) return reply.status(404).send("Not Found");
    const extension = await storage.getById(req.params.id);
    if (
      !extension ||
      extension.runtime !== "client" ||
      !extension.enabled ||
      !extension.js?.trim() ||
      extension.approvedHash !== extension.contentHash ||
      req.query.hash !== extension.contentHash
    ) {
      return reply.status(404).send("Not Found");
    }
    reply.type("text/javascript; charset=utf-8");
    reply.header("Cache-Control", "no-store");
    return javascriptResponse(extension.id, extension.contentHash, extension.name, extension.js);
  });

  app.post("/", async (req, reply) => {
    if (!privileged(req, reply)) return;
    const input = createPersonalExtensionSchema.parse(req.body);
    const existing = await storage.getByName(input.name);
    if (existing) {
      return reply.status(409).send({ error: `A Personal Extension named "${input.name}" already exists`, id: existing.id });
    }
    return storage.create(input, { source: "local" });
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

  app.get<{ Params: { id: string } }>("/:id/storage", async (req, reply) => {
    const extension = ID_PATTERN.test(req.params.id) ? await storage.getById(req.params.id) : null;
    if (!extension || !extension.enabled || extension.approvedHash !== extension.contentHash) {
      return reply.status(404).send({ error: "Personal Extension not found" });
    }
    return { value: await settings.get(extension.id) };
  });

  app.patch<{ Params: { id: string } }>("/:id/storage", async (req, reply) => {
    const extension = ID_PATTERN.test(req.params.id) ? await storage.getById(req.params.id) : null;
    if (!extension || !extension.enabled || extension.approvedHash !== extension.contentHash) {
      return reply.status(404).send({ error: "Personal Extension not found" });
    }
    const patch = personalExtensionStoragePatchSchema.parse(req.body ?? {});
    return { value: await settings.patch(extension.id, patch) };
  });

  app.delete<{ Params: { id: string } }>("/:id/storage", async (req, reply) => {
    const extension = ID_PATTERN.test(req.params.id) ? await storage.getById(req.params.id) : null;
    if (!extension || !extension.enabled || extension.approvedHash !== extension.contentHash) {
      return reply.status(404).send({ error: "Personal Extension not found" });
    }
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
