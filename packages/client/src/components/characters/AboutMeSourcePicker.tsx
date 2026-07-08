// ──────────────────────────────────────────────
// Checkbox panel that configures which sources the AI-write "about me" draws
// from. Shared by the character-card editor and the in-chat about-me popout.
// ──────────────────────────────────────────────
import type { AboutMeSourceConfig } from "@marinara-engine/shared";
import { DEFAULT_ABOUT_ME_CHAT_CONTEXT_LIMIT } from "@marinara-engine/shared";
import { HelpTooltip } from "../ui/HelpTooltip";

const CARD_FIELDS: Array<{ key: keyof AboutMeSourceConfig; label: string }> = [
  { key: "description", label: "Description" },
  { key: "personality", label: "Personality" },
  { key: "scenario", label: "Scenario" },
  { key: "backstory", label: "Backstory" },
  { key: "appearance", label: "Appearance" },
];

function SourceRow({
  label,
  checked,
  disabled,
  tooltip,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  tooltip?: string;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <label
      className={
        "flex items-center gap-2 text-xs " +
        (disabled ? "cursor-not-allowed text-[var(--muted-foreground)]/50" : "text-[var(--foreground)]")
      }
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-3.5 w-3.5 shrink-0 accent-[var(--primary)] disabled:opacity-50"
      />
      <span className="inline-flex items-center gap-1">
        {label}
        {tooltip && <HelpTooltip text={tooltip} />}
      </span>
    </label>
  );
}

export function AboutMeSourcePicker({
  value,
  onChange,
  /** In-chat (chat-specific about me) enables the chat-context source; the card editor doesn't. */
  allowChatContext,
}: {
  value: AboutMeSourceConfig;
  onChange: (next: AboutMeSourceConfig) => void;
  allowChatContext: boolean;
}) {
  const toggle = (key: keyof AboutMeSourceConfig, checked: boolean) => onChange({ ...value, [key]: checked });

  return (
    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-3">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        AI Write draws from
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {CARD_FIELDS.map((f) => (
          <SourceRow key={f.key} label={f.label} checked={!!value[f.key]} onToggle={(c) => toggle(f.key, c)} />
        ))}
      </div>
      <div className="space-y-1.5 border-t border-[var(--border)] pt-2">
        <SourceRow
          label="Convo behavior"
          checked={!!value.convoBehavior}
          onToggle={(c) => toggle("convoBehavior", c)}
        />
        <SourceRow
          label="Lorebook entries"
          checked={!!value.lorebook}
          onToggle={(c) => toggle("lorebook", c)}
          tooltip="This character's linked and embedded lorebook entries — handy when the card fields are blank and the substance lives in the lorebook."
        />
        <div className="flex flex-wrap items-center gap-2">
          <SourceRow
            label="Chat context"
            checked={!!value.chatContext}
            disabled={!allowChatContext}
            onToggle={(c) => toggle("chatContext", c)}
            tooltip={
              allowChatContext
                ? "Include recent messages from this chat so the bio reflects how they've been acting here."
                : "Only works for a chat-specific about me (edited from within a chat). The card editor has no chat to read."
            }
          />
          {allowChatContext && value.chatContext && (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <input
                type="number"
                min={1}
                max={200}
                value={value.chatContextLimit ?? DEFAULT_ABOUT_ME_CHAT_CONTEXT_LIMIT}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  onChange({
                    ...value,
                    chatContextLimit: Number.isFinite(n) ? Math.max(1, Math.min(200, Math.round(n))) : undefined,
                  });
                }}
                className="w-14 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-1.5 py-0.5 text-xs outline-none focus:border-[var(--primary)]/40"
              />
              msgs
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
