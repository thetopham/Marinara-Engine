import { useMemo } from "react";
import { Loader2, Navigation } from "lucide-react";
import type { GameLocation, GameLocationLink } from "@marinara-engine/shared";
import { resolveAvailableDestinations } from "@marinara-engine/shared";
import { cn } from "../../../lib/utils";

interface GameLocationPickerProps {
  locations: GameLocation[];
  links?: GameLocationLink[];
  currentLocationId: string | null;
  disabled?: boolean;
  isPending?: boolean;
  onSelectLocation: (locationId: string, linkId?: string | null) => void;
  className?: string;
}

export function GameLocationPicker({
  locations,
  links = [],
  currentLocationId,
  disabled = false,
  isPending = false,
  onSelectLocation,
  className,
}: GameLocationPickerProps) {
  const destinations = useMemo(
    () => resolveAvailableDestinations(locations, currentLocationId, { links }),
    [currentLocationId, links, locations],
  );

  if (destinations.length === 0) return null;

  return (
    <div className={cn("flex max-w-[min(38rem,calc(100vw-7rem))] flex-wrap items-center gap-1.5", className)}>
      {destinations.map(({ location, via, link }) => (
        <button
          key={`${via}:${link?.id ?? location.id}`}
          type="button"
          disabled={disabled || isPending}
          onClick={() => onSelectLocation(location.id, link?.id ?? null)}
          className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white/75 ring-1 ring-white/10 backdrop-blur transition hover:bg-black/65 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          title={link?.description || location.description || `Move to ${location.name}`}
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
          <span className="max-w-36 truncate">{link?.label || location.name}</span>
        </button>
      ))}
    </div>
  );
}
