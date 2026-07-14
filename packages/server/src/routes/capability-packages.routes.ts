import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { BUILT_IN_AGENT_MANIFESTS } from "@marinara-engine/shared";
import { requirePrivilegedAccess } from "../middleware/privileged-gate.js";
import { capabilityPackageManager } from "../services/capability-packages/package-manager.service.js";
import { refreshCapabilityAgentRegistry } from "../services/capability-packages/capability-agent-registry.service.js";

const packageParams = z.object({ id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80) });

export async function capabilityPackagesRoutes(app: FastifyInstance) {
  app.get("/catalog", async () => capabilityPackageManager.catalog());
  app.get("/installed", async () => capabilityPackageManager.installed());
  app.get("/agents", async () => BUILT_IN_AGENT_MANIFESTS);
  app.post<{ Params: { id: string } }>("/:id/install", async (request, reply) => {
    if (!requirePrivilegedAccess(request, reply, { feature: "Agent package installation" })) return;
    const { id } = packageParams.parse(request.params);
    const installed = await capabilityPackageManager.install(id);
    await refreshCapabilityAgentRegistry();
    return installed;
  });
  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    if (!requirePrivilegedAccess(request, reply, { feature: "Agent package removal" })) return;
    const { id } = packageParams.parse(request.params);
    if (!(await capabilityPackageManager.uninstall(id))) return reply.status(404).send({ error: "Package not found" });
    await refreshCapabilityAgentRegistry();
    return reply.status(204).send();
  });
}
