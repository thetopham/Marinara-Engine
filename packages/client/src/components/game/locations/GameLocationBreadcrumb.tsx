import { MapPin } from "lucide-react";
import type { GameLocation, GameLocationLink } from "@marinara-engine/shared";
import { resolveLocationAncestry } from "@marinara-engine/shared";
import { cn } from "../../../lib/utils";

interface GameLocationBreadcrumbProps {
  locations: GameLocation[];
  links?: GameLocationLink[];
  currentLocationId: string | null;
  className?: string;
}

export function GameLocationBreadcrumb({ locations, currentLocationId, className }: GameLocationBreadcrumbProps) {
  const { path, currentLocation } = resolveLocationAncestry(locations, currentLocationId);

  if (!currentLocation) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-xs text-white/60 ring-1 ring-white/10 backdrop-blur",
          className,
        )}
      >
        <MapPin size={13} />
        <span>Location unknown</span>
      </div>
    );
  }

  return (
    <nav
      aria-label="Current game location"
      className={cn(
        "flex max-w-[min(34rem,calc(100vw-7rem))] items-center gap-1 overflow-hidden rounded-full bg-black/50 px-3 py-2 text-xs text-white/80 shadow-lg ring-1 ring-white/10 backdrop-blur",
        className,
      )}
    >
      <MapPin size={13} className="shrink-0 text-[var(--primary)]" />
      {path.map((location, index) => (
        <span key={location.id} className="flex min-w-0 items-center gap-1">
          {index > 0 && <span className="text-white/35">/</span>}
          <span className={cn("truncate", index === path.length - 1 ? "font-semibold text-white" : "text-white/65")}>
            {location.icon ? `${location.icon} ` : ""}
            {location.name}
          </span>
        </span>
      ))}
    </nav>
  );
}
