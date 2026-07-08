// ──────────────────────────────────────────────
// About Me viewer (Conversation mode) — opened by clicking an avatar.
// Shows the effective about-me (per-chat override, else card/persona default)
// and lets the user set / edit / clear the chat-specific override, Discord
// "per-server profile" style.
// ──────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { Pencil, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Chat } from "@marinara-engine/shared";
import { useChat, useUpdateChatMetadata } from "../../hooks/use-chats";
import { useCharacter, usePersonas } from "../../hooks/use-characters";
import { useChatStore } from "../../stores/chat.store";
import { cn } from "../../lib/utils";
import { Modal } from "../ui/Modal";

interface AboutMeViewerModalProps {
  open: boolean;
  onClose: () => void;
  kind: "character" | "persona";
  id: string;
}

function parseCharacterConvo(data: unknown): { name: string; displayName: string; aboutMe: string } {
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = (typeof data === "string" ? JSON.parse(data) : data) as Record<string, unknown>;
  } catch {
    parsed = null;
  }
  const ext = (parsed?.extensions ?? {}) as Record<string, unknown>;
  const name = typeof parsed?.name === "string" ? parsed.name : "";
  const displayName = typeof ext.convoDisplayName === "string" && ext.convoDisplayName ? ext.convoDisplayName : name;
  return { name, displayName, aboutMe: typeof ext.aboutMe === "string" ? ext.aboutMe : "" };
}

export function AboutMeViewerModal({ open, onClose, kind, id }: AboutMeViewerModalProps) {
  const activeChatId = useChatStore((s) => s.activeChatId);
  const { data: chat } = useChat(activeChatId);
  const { data: character } = useCharacter(kind === "character" ? id : null);
  const { data: personas } = usePersonas(kind === "persona");
  const updateMeta = useUpdateChatMetadata();

  const profile = useMemo(() => {
    if (kind === "character") {
      return parseCharacterConvo((character as { data?: unknown } | undefined)?.data);
    }
    const persona = ((personas ?? []) as Array<Record<string, unknown>>).find((p) => p.id === id);
    const name = typeof persona?.name === "string" ? persona.name : "";
    const displayName =
      typeof persona?.convoDisplayName === "string" && persona.convoDisplayName ? persona.convoDisplayName : name;
    return { name, displayName, aboutMe: typeof persona?.aboutMe === "string" ? persona.aboutMe : "" };
  }, [character, id, kind, personas]);

  const metadata = (chat?.metadata ?? {}) as Chat["metadata"];
  const overrides = (metadata.conversationAboutMeOverrides ?? {}) as Record<string, string>;
  const override = typeof overrides[id] === "string" ? overrides[id] : undefined;
  const hasOverride = override !== undefined && override.trim().length > 0;
  const effective = hasOverride ? override! : profile.aboutMe;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  // Reset editor state whenever the viewer target or open-state changes.
  useEffect(() => {
    setEditing(false);
    setDraft("");
  }, [id, kind, open]);

  const chatId = activeChatId;
  const isPending = updateMeta.isPending;

  const writeOverrides = async (next: Record<string, string>) => {
    if (!chatId) return;
    await updateMeta.mutateAsync({ id: chatId, conversationAboutMeOverrides: next });
  };

  const handleSave = async () => {
    if (!chatId || isPending) return;
    try {
      await writeOverrides({ ...overrides, [id]: draft });
      setEditing(false);
      toast.success("Chat-specific about me saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleClear = async () => {
    if (!chatId || isPending) return;
    const next = { ...overrides };
    delete next[id];
    try {
      await writeOverrides(next);
      setEditing(false);
      toast.success("Reverted to the default about me");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={profile.displayName || "About Me"} width="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.625rem] font-medium",
              hasOverride
                ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)]",
            )}
          >
            {hasOverride ? "Chat-specific" : "Default profile"}
          </span>
          {hasOverride && (
            <span className="text-[0.625rem] text-[var(--muted-foreground)]">
              Only shown in this conversation, overriding the default.
            </span>
          )}
        </div>

        {!editing ? (
          <div className="min-h-[4rem] whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--secondary)]/50 p-3 text-sm leading-relaxed text-[var(--foreground)]">
            {effective.trim() ? (
              effective
            ) : (
              <span className="text-[var(--muted-foreground)]">No about me set.</span>
            )}
          </div>
        ) : (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            autoFocus
            placeholder="What this person shows in this conversation…"
            className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-[var(--muted-foreground)]/40 focus:border-[var(--primary)]/40 focus:ring-1 focus:ring-[var(--primary)]/20"
          />
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {!editing ? (
            <>
              {hasOverride && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
                >
                  <Trash2 size="0.8125rem" />
                  Clear override
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setDraft(effective);
                  setEditing(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
              >
                <Pencil size="0.8125rem" />
                {hasOverride ? "Edit for this chat" : "Set for this chat"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)]"
              >
                <RotateCcw size="0.8125rem" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Save size="0.8125rem" />
                {isPending ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
        <p className="text-[0.625rem] text-[var(--muted-foreground)]">
          The default about me is edited on the {kind === "persona" ? "persona" : "character"} card. A chat-specific
          override only applies here.
        </p>
      </div>
    </Modal>
  );
}
