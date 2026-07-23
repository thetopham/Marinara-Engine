import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Brain, X } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  NEUTRAL_PANEL_HEADER,
  NEUTRAL_PANEL_SCROLL_AREA,
  NEUTRAL_PANEL_SHELL,
  NEUTRAL_PANEL_TITLE,
} from "../ui/neutral-surface-styles";

export function MessageThinkingModal({ thinking, onClose }: { thinking: string; onClose: () => void }) {
  const { t } = useTranslation();
  const title = t("chat.message.thoughts.title");

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm max-md:pt-[env(safe-area-inset-top)]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn(NEUTRAL_PANEL_SHELL, "relative mx-4 flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={cn(NEUTRAL_PANEL_HEADER, "flex items-center justify-between gap-3 px-4 py-3")}>
          <div className={cn(NEUTRAL_PANEL_TITLE, "text-sm")}>
            <Brain size="0.875rem" className="text-[var(--marinara-chat-chrome-button-text-active)]" />
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mari-chrome-control mari-chrome-control--small p-1.5"
            aria-label={t("chat.message.thoughts.close")}
          >
            <X size="0.875rem" />
          </button>
        </div>
        <div className={cn(NEUTRAL_PANEL_SCROLL_AREA, "overflow-y-auto px-4 py-3")}>
          <pre className="whitespace-pre-wrap break-words text-[0.8125rem] leading-relaxed text-[var(--marinara-chat-chrome-panel-text)]">
            {thinking}
          </pre>
        </div>
      </div>
    </div>,
    document.body,
  );
}
