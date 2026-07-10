import { BookOpen, Dices, Sparkles, UserPlus, Wand2, type LucideIcon } from "lucide-react";
import type { MariSuggestionChip } from "@marinara-engine/shared";
import { cn } from "../../lib/utils";

interface MariSuggestionChipsProps {
  chips: MariSuggestionChip[];
  onSelect: (chip: MariSuggestionChip) => void;
  disabled?: boolean;
  compact?: boolean;
}

const CHIP_ICONS: Record<string, LucideIcon> = {
  UserPlus,
  BookOpen,
  Sparkles,
  Wand2,
  Dices,
};

export function MariSuggestionChips({ chips, onSelect, disabled = false, compact = false }: MariSuggestionChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn("mari-suggestion-chips", compact && "mari-suggestion-chips--compact")}>
      {chips.map((chip) => {
        const Icon = chip.icon ? CHIP_ICONS[chip.icon] : undefined;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onSelect(chip)}
            disabled={disabled}
            className={cn(
              "mari-panel-gradient-button max-w-full text-left text-xs leading-tight",
              chip.entity && `mari-panel-gradient--${chip.entity}`,
              chip.tone === "danger" && "mari-suggestion-chip--danger",
              chip.tone === "caution" && "mari-suggestion-chip--caution",
              chip.tone === "success" && "mari-suggestion-chip--success",
            )}
            title={chip.prompt}
          >
            {Icon ? <Icon size={compact ? "0.75rem" : "0.875rem"} className="shrink-0" /> : null}
            <span className="min-w-0 truncate">{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
