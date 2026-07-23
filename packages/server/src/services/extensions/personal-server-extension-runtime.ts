import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { DB } from "../../db/connection.js";
import { logger } from "../../lib/logger.js";
import { getDataDir } from "../../utils/data-dir.js";
import { safeFetch } from "../../utils/security.js";
import { createAppSettingsStorage } from "../storage/app-settings.storage.js";
import { createPersonalExtensionSettingsStorage } from "./personal-extension-settings.service.js";
import { createPersonalExtensionsStorage } from "./personal-extension-storage.service.js";
import type { PersonalExtension } from "@marinara-engine/shared";

type CleanupFn = () => void | Promise<void>;
type ActiveExtension = {
  id: string;
  contentHash: string;
  name: string;
  cleanupFns: CleanupFn[];
};
type RuntimeStatus = { status: "running" | "stopped" | "error"; error: string | null };

const STARTUP_TIMEOUT_MS = 10_000;
const CLEANUP_TIMEOUT_MS = 5_000;
const FETCH_MAX_BYTES = 25 * 1024 * 1024;

function describeError(error: unknown) {
  return error instanceof Error ? error.message || error.name : String(error);
}

function moduleFilename(runtimeDir: string, extension: PersonalExtension) {
  const digest = extension.contentHash.replace(/^sha256:/, "");
  return join(runtimeDir, `${extension.id}-${digest}.mjs`);
}

export class PersonalServerExtensionRuntime {
  private db: DB | null = null;
  private active = new Map<string, ActiveExtension>();
  private statuses = new Map<string, RuntimeStatus>();
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly runtimeDir = join(getDataDir(), "personal-extension-runtime")) {}

  async start(db: DB) {
    this.db = db;
    await this.reloadAll();
  }

  async stop() {
    await this.stopAll();
    this.db = null;
  }

  withRuntimeStatus(extension: PersonalExtension): PersonalExtension {
    if (extension.runtime !== "server") return extension;
    const status = this.statuses.get(extension.id);
    return {
      ...extension,
      serverStatus: extension.enabled ? (status?.status ?? "stopped") : "stopped",
      serverError: status?.error ?? null,
    };
  }

  reloadAll() {
    this.queue = this.queue.then(() => this.reloadAllNow()).catch((error) => {
      logger.error(error, "[personal-extensions] Server runtime reload failed");
    });
    return this.queue;
  }

  reloadExtension(id: string) {
    this.queue = this.queue.then(() => this.reloadExtensionNow(id)).catch((error) => {
      logger.error(error, "[personal-extensions] Server extension reload failed for %s", id);
    });
    return this.queue;
  }

  unloadExtension(id: string) {
    this.queue = this.queue.then(() => this.unloadExtensionNow(id)).catch((error) => {
      logger.error(error, "[personal-extensions] Server extension unload failed for %s", id);
    });
    return this.queue;
  }

  private async reloadAllNow() {
    if (!this.db) return;
    await this.stopAll();
    this.statuses.clear();
    const extensions = await createPersonalExtensionsStorage(this.db).list();
    for (const extension of extensions.filter((candidate) => candidate.runtime === "server")) {
      if (!extension.enabled) {
        this.statuses.set(extension.id, { status: "stopped", error: null });
        continue;
      }
      await this.tryLoad(extension);
    }
  }

  private async reloadExtensionNow(id: string) {
    if (!this.db) return;
    await this.unloadExtensionNow(id);
    const extension = await createPersonalExtensionsStorage(this.db).getById(id);
    if (!extension || extension.runtime !== "server") return;
    if (!extension.enabled) {
      this.statuses.set(id, { status: "stopped", error: null });
      return;
    }
    await this.tryLoad(extension);
  }

  private async tryLoad(extension: PersonalExtension) {
    try {
      await this.load(extension);
      this.statuses.set(extension.id, { status: "running", error: null });
    } catch (error) {
      const message = describeError(error);
      this.statuses.set(extension.id, { status: "error", error: message });
      logger.error(error, "[personal-extensions] Failed to load %s (%s)", extension.name, extension.id);
    }
  }

  private async unloadExtensionNow(id: string) {
    const active = this.active.get(id);
    this.active.delete(id);
    this.statuses.delete(id);
    if (active) await this.stopExtension(active);
  }

  private async stopAll() {
    const active = [...this.active.values()];
    this.active.clear();
    for (const extension of active) await this.stopExtension(extension);
  }

  private async stopExtension(extension: ActiveExtension) {
    for (const cleanup of [...extension.cleanupFns].reverse()) {
      try {
        await Promise.race([
          Promise.resolve(cleanup()),
          new Promise((_, reject) => {
            const timer = setTimeout(() => reject(new Error("Personal extension cleanup timed out")), CLEANUP_TIMEOUT_MS);
            timer.unref?.();
          }),
        ]);
      } catch (error) {
        logger.warn(error, "[personal-extensions] Cleanup failed for %s (%s)", extension.name, extension.id);
      }
    }
  }

  private async load(extension: PersonalExtension) {
    if (!this.db) throw new Error("Personal extension runtime is not connected to storage");
    if (!extension.enabled || extension.approvedHash !== extension.contentHash) {
      throw new Error("Personal extension is not approved for its current content");
    }
    if (!extension.serverJs?.trim()) throw new Error("Server JavaScript is empty");

    await mkdir(this.runtimeDir, { recursive: true });
    const filePath = moduleFilename(this.runtimeDir, extension);
    const source = [
      "export default async function startPersonalExtension(marinara) {",
      '  "use strict";',
      extension.serverJs,
      "}",
      `//# sourceURL=marinara-personal-extension-${extension.id}.mjs`,
      "",
    ].join("\n");
    await writeFile(filePath, source, { encoding: "utf8", mode: 0o600 });

    const cleanupFns: CleanupFn[] = [];
    const addCleanup = (fn: CleanupFn) => cleanupFns.push(fn);
    const active: ActiveExtension = {
      id: extension.id,
      contentHash: extension.contentHash,
      name: extension.name,
      cleanupFns,
    };
    const settings = createPersonalExtensionSettingsStorage(createAppSettingsStorage(this.db));
    const log = (level: "debug" | "info" | "warn" | "error", args: unknown[]) => {
      logger[level]({ extensionId: extension.id, extensionName: extension.name, args }, "[personal-extension] %s", extension.name);
    };
    const managedTimeout = (fn: () => void, ms: number) => {
      const timer = setTimeout(fn, Math.max(0, Math.min(2 ** 31 - 1, Number(ms) || 0)));
      addCleanup(() => clearTimeout(timer));
      return timer;
    };
    const managedInterval = (fn: () => void, ms: number) => {
      const timer = setInterval(fn, Math.max(1, Math.min(2 ** 31 - 1, Number(ms) || 1)));
      addCleanup(() => clearInterval(timer));
      return timer;
    };
    const marinara = Object.freeze({
      runtime: "server" as const,
      version: 1,
      extensionId: extension.id,
      extensionName: extension.name,
      log: Object.freeze({
        debug: (...args: unknown[]) => log("debug", args),
        info: (...args: unknown[]) => log("info", args),
        warn: (...args: unknown[]) => log("warn", args),
        error: (...args: unknown[]) => log("error", args),
      }),
      fetch: (url: string | URL, init?: RequestInit) =>
        safeFetch(url, {
          ...(init ?? {}),
          policy: { allowedProtocols: ["https:", "http:"] },
          maxResponseBytes: FETCH_MAX_BYTES,
          bufferResponse: false,
        }),
      storage: Object.freeze({
        get: () => settings.get(extension.id),
        patch: (patch: Record<string, unknown>) => settings.patch(extension.id, patch),
        delete: () => settings.remove(extension.id),
      }),
      setTimeout: managedTimeout,
      setInterval: managedInterval,
      clearTimeout,
      clearInterval,
      onCleanup: (fn: CleanupFn) => {
        if (typeof fn !== "function") throw new Error("onCleanup requires a function");
        addCleanup(fn);
      },
    });

    try {
      const module = (await import(`${pathToFileURL(filePath).href}?hash=${encodeURIComponent(extension.contentHash)}`)) as {
        default?: (api: typeof marinara) => unknown;
      };
      if (typeof module.default !== "function") throw new Error("Personal extension module has no start function");
      await Promise.race([
        Promise.resolve(module.default(marinara)),
        new Promise((_, reject) => {
          const timer = setTimeout(() => reject(new Error("Personal extension startup timed out")), STARTUP_TIMEOUT_MS);
          timer.unref?.();
        }),
      ]);
      this.active.set(extension.id, active);
      logger.info("[personal-extensions] Loaded %s (%s) at %s", extension.name, extension.id, extension.contentHash);
    } catch (error) {
      await this.stopExtension(active);
      throw error;
    }
  }
}

export const personalServerExtensionRuntime = new PersonalServerExtensionRuntime();
