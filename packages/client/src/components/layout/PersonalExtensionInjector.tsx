import { useEffect } from "react";
import { CSRF_HEADER, CSRF_HEADER_VALUE, type PersonalClientExtensionRuntime } from "@marinara-engine/shared";
import { usePersonalExtensionRuntime } from "../../hooks/use-personal-extensions";
import { sanitizeAppCss } from "../../lib/theme-css";

type CleanupFn = () => void | Promise<void>;
type PersonalExtensionMain = (marinara: ReturnType<typeof createPersonalExtensionApi>) => void | Promise<void>;
type ActiveClientExtension = {
  contentHash: string;
  cleanupFns: CleanupFn[];
  script: HTMLScriptElement | null;
};

declare global {
  interface Window {
    __marinaraRunPersonalExtension?: (
      id: string,
      contentHash: string,
      name: string,
      main: PersonalExtensionMain,
    ) => Promise<void>;
  }
}

const activeExtensions = new Map<string, ActiveClientExtension>();
let expectedExtensions = new Map<string, PersonalClientExtensionRuntime>();

async function cleanupExtension(id: string) {
  const active = activeExtensions.get(id);
  activeExtensions.delete(id);
  if (!active) return;
  active.script?.remove();
  for (const cleanup of [...active.cleanupFns].reverse()) {
    try {
      await cleanup();
    } catch (error) {
      console.warn(`[Personal Extension ${id}] cleanup failed`, error);
    }
  }
}

function createPersonalExtensionApi(id: string, name: string, cleanupFns: CleanupFn[]) {
  const addCleanup = (cleanup: CleanupFn) => cleanupFns.push(cleanup);
  const apiFetch = (path: string, init: RequestInit = {}) => {
    const normalized = path.startsWith("/api/") ? path : `/api/${path.replace(/^\/+/, "")}`;
    const method = (init.method ?? "GET").toUpperCase();
    const headers = new Headers(init.headers);
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      headers.set(CSRF_HEADER, CSRF_HEADER_VALUE);
      if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }
    return fetch(normalized, { ...init, headers, cache: "no-store" });
  };

  return Object.freeze({
    runtime: "client" as const,
    version: 1,
    extensionId: id,
    extensionName: name,
    addStyle(css: string) {
      const style = document.createElement("style");
      style.dataset.personalExtensionStyle = id;
      style.textContent = sanitizeAppCss(String(css));
      document.head.appendChild(style);
      addCleanup(() => style.remove());
      return style;
    },
    addElement(parent: Element | string, tag: string, attrs: Record<string, unknown> = {}) {
      const resolvedParent = typeof parent === "string" ? document.querySelector(parent) : parent;
      if (!resolvedParent) return null;
      const element = document.createElement(tag);
      for (const [key, value] of Object.entries(attrs)) {
        if (key === "textContent") element.textContent = String(value ?? "");
        else if (key === "innerHTML") element.innerHTML = String(value ?? "");
        else if (value !== undefined && value !== null) element.setAttribute(key, String(value));
      }
      resolvedParent.appendChild(element);
      addCleanup(() => element.remove());
      return element;
    },
    apiFetch,
    storage: Object.freeze({
      async get() {
        const response = await apiFetch(`/personal-extensions/${id}/storage`);
        if (!response.ok) throw new Error(`Personal Extension storage read failed (${response.status})`);
        const payload = (await response.json()) as { value?: Record<string, unknown> };
        return payload.value ?? {};
      },
      async patch(patch: Record<string, unknown>) {
        const response = await apiFetch(`/personal-extensions/${id}/storage`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        if (!response.ok) throw new Error(`Personal Extension storage update failed (${response.status})`);
        const payload = (await response.json()) as { value?: Record<string, unknown> };
        return payload.value ?? {};
      },
      async delete() {
        const response = await apiFetch(`/personal-extensions/${id}/storage`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Personal Extension storage delete failed (${response.status})`);
      },
    }),
    on(target: EventTarget, event: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) {
      target.addEventListener(event, handler, options);
      addCleanup(() => target.removeEventListener(event, handler, options));
    },
    setTimeout(fn: () => void, ms: number) {
      const timer = window.setTimeout(fn, ms);
      addCleanup(() => window.clearTimeout(timer));
      return timer;
    },
    setInterval(fn: () => void, ms: number) {
      const timer = window.setInterval(fn, ms);
      addCleanup(() => window.clearInterval(timer));
      return timer;
    },
    observe(target: Node, callback: MutationCallback, options: MutationObserverInit = { childList: true, subtree: true }) {
      const observer = new MutationObserver(callback);
      observer.observe(target, options);
      addCleanup(() => observer.disconnect());
      return observer;
    },
    onCleanup(cleanup: CleanupFn) {
      if (typeof cleanup !== "function") throw new Error("onCleanup requires a function");
      addCleanup(cleanup);
    },
  });
}

export function PersonalExtensionInjector() {
  const { data: extensions = [] } = usePersonalExtensionRuntime();

  useEffect(() => {
    expectedExtensions = new Map(extensions.map((extension) => [extension.id, extension]));
    window.__marinaraRunPersonalExtension = async (id, contentHash, name, main) => {
      const expected = expectedExtensions.get(id);
      if (!expected || expected.contentHash !== contentHash || !expected.hasJavaScript) return;
      await cleanupExtension(id);
      const cleanupFns: CleanupFn[] = [];
      const active: ActiveClientExtension = { contentHash, cleanupFns, script: null };
      activeExtensions.set(id, active);
      try {
        await main(createPersonalExtensionApi(id, name, cleanupFns));
        window.dispatchEvent(new CustomEvent("marinara-personal-extension-ready", { detail: { id, contentHash } }));
      } catch (error) {
        await cleanupExtension(id);
        console.error(`[Personal Extension ${name}] failed`, error);
        window.dispatchEvent(
          new CustomEvent("marinara-personal-extension-error", {
            detail: { id, contentHash, message: error instanceof Error ? error.message : String(error) },
          }),
        );
      }
    };

    for (const [id, active] of activeExtensions) {
      const expected = expectedExtensions.get(id);
      if (!expected || expected.contentHash !== active.contentHash || !expected.hasJavaScript) {
        void cleanupExtension(id);
      }
    }

    for (const extension of extensions) {
      const styleId = `marinara-personal-extension-style-${extension.id}`;
      let style = document.getElementById(styleId) as HTMLStyleElement | null;
      if (extension.css?.trim()) {
        if (!style) {
          style = document.createElement("style");
          style.id = styleId;
          document.head.appendChild(style);
        }
        style.textContent = sanitizeAppCss(extension.css);
      } else {
        style?.remove();
      }

      const active = activeExtensions.get(extension.id);
      if (!extension.hasJavaScript || active?.contentHash === extension.contentHash) continue;
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `/api/personal-extensions/${encodeURIComponent(extension.id)}/runtime.js?hash=${encodeURIComponent(extension.contentHash)}`;
      script.dataset.personalExtensionScript = extension.id;
      script.addEventListener("error", () => {
        const failed = activeExtensions.get(extension.id);
        if (failed?.script === script) activeExtensions.delete(extension.id);
        script.remove();
        console.error(`[Personal Extension ${extension.name}] script could not be loaded`);
      });
      document.head.appendChild(script);
      activeExtensions.set(extension.id, { contentHash: extension.contentHash, cleanupFns: [], script });
    }

    const activeStyleIds = new Set(extensions.filter((extension) => extension.css?.trim()).map((extension) => extension.id));
    document.querySelectorAll<HTMLStyleElement>("[id^='marinara-personal-extension-style-']").forEach((style) => {
      const id = style.id.replace("marinara-personal-extension-style-", "");
      if (!activeStyleIds.has(id)) style.remove();
    });
  }, [extensions]);

  useEffect(
    () => () => {
      delete window.__marinaraRunPersonalExtension;
      expectedExtensions = new Map();
      for (const id of [...activeExtensions.keys()]) void cleanupExtension(id);
      document.querySelectorAll("[id^='marinara-personal-extension-style-']").forEach((element) => element.remove());
    },
    [],
  );

  return null;
}
