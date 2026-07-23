import { useEffect } from "react";
import { CSRF_HEADER, CSRF_HEADER_VALUE, type PersonalClientExtensionRuntime } from "@marinara-engine/shared";
import { usePersonalExtensionRuntime } from "../../hooks/use-personal-extensions";

type ActiveClientExtension = {
  contentHash: string;
  extension: PersonalClientExtensionRuntime;
  iframe: HTMLIFrameElement;
};

type SandboxMessage = {
  channel?: string;
  type?: "ready" | "error" | "log" | "storage";
  contentHash?: string;
  requestId?: string;
  action?: "get" | "patch" | "delete";
  payload?: unknown;
  level?: "debug" | "info" | "warn" | "error";
  args?: unknown[];
  message?: string;
};

const activeExtensions = new Map<string, ActiveClientExtension>();

function extensionFetch(id: string, path: string, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set(CSRF_HEADER, CSRF_HEADER_VALUE);
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }
  return fetch(`/api/personal-extensions/${encodeURIComponent(id)}/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

async function cleanupExtension(id: string) {
  const active = activeExtensions.get(id);
  activeExtensions.delete(id);
  if (!active) return;
  active.iframe.contentWindow?.postMessage({ channel: "marinara-personal-extension", type: "stop" }, "*");
  active.iframe.remove();
}

async function handleStorage(active: ActiveClientExtension, message: SandboxMessage) {
  if (!message.requestId || !message.action) return;
  try {
    let value: Record<string, unknown> = {};
    if (message.action === "get") {
      const response = await extensionFetch(active.extension.id, "storage");
      if (!response.ok) throw new Error(`Storage read failed (${response.status})`);
      value = ((await response.json()) as { value?: Record<string, unknown> }).value ?? {};
    } else if (message.action === "patch") {
      const response = await extensionFetch(active.extension.id, "storage", {
        method: "PATCH",
        body: JSON.stringify(message.payload ?? {}),
      });
      if (!response.ok) throw new Error(`Storage update failed (${response.status})`);
      value = ((await response.json()) as { value?: Record<string, unknown> }).value ?? {};
    } else {
      const response = await extensionFetch(active.extension.id, "storage", { method: "DELETE" });
      if (!response.ok) throw new Error(`Storage delete failed (${response.status})`);
    }
    active.iframe.contentWindow?.postMessage(
      {
        channel: "marinara-personal-extension",
        type: "storage-result",
        requestId: message.requestId,
        ok: true,
        value,
      },
      "*",
    );
  } catch (error) {
    active.iframe.contentWindow?.postMessage(
      {
        channel: "marinara-personal-extension",
        type: "storage-result",
        requestId: message.requestId,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      "*",
    );
  }
}

export function PersonalExtensionInjector() {
  const { data: extensions = [] } = usePersonalExtensionRuntime();

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      const active = [...activeExtensions.values()].find((candidate) => candidate.iframe.contentWindow === event.source);
      if (!active || event.origin !== "null") return;
      const message = event.data as SandboxMessage;
      if (!message || message.channel !== "marinara-personal-extension") return;
      if (message.type === "storage") {
        void handleStorage(active, message);
        return;
      }
      if (message.type === "log" && message.level) {
        console[message.level](`[Personal Extension ${active.extension.name}]`, ...(message.args ?? []));
        return;
      }
      if (message.type === "ready" && message.contentHash === active.contentHash) {
        window.dispatchEvent(
          new CustomEvent("marinara-personal-extension-ready", {
            detail: { id: active.extension.id, contentHash: active.contentHash },
          }),
        );
        return;
      }
      if (message.type === "error") {
        console.error(`[Personal Extension ${active.extension.name}] failed`, message.message);
        window.dispatchEvent(
          new CustomEvent("marinara-personal-extension-error", {
            detail: {
              id: active.extension.id,
              contentHash: active.contentHash,
              message: message.message ?? "Sandboxed browser extension failed",
            },
          }),
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const expected = new Map(extensions.map((extension) => [extension.id, extension]));
    for (const [id, active] of activeExtensions) {
      const next = expected.get(id);
      if (!next || next.contentHash !== active.contentHash) void cleanupExtension(id);
    }

    for (const extension of extensions) {
      const active = activeExtensions.get(extension.id);
      if (active?.contentHash === extension.contentHash) continue;
      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.setAttribute("aria-hidden", "true");
      iframe.tabIndex = -1;
      iframe.hidden = true;
      iframe.src = extension.sandboxUrl;
      iframe.dataset.personalExtensionSandbox = extension.id;
      iframe.referrerPolicy = "no-referrer";
      document.body.appendChild(iframe);
      activeExtensions.set(extension.id, {
        contentHash: extension.contentHash,
        extension,
        iframe,
      });
    }
  }, [extensions]);

  useEffect(
    () => () => {
      for (const id of [...activeExtensions.keys()]) void cleanupExtension(id);
    },
    [],
  );

  return null;
}
