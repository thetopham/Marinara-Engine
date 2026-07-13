import { useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
import type { GameLocation, GameLocationLink, GameLocationState } from "@marinara-engine/shared";
import { cn } from "../../../lib/utils";

interface GameLocationEditorProps {
  state: GameLocationState;
  onSave: (
    state: Pick<GameLocationState, "locations" | "links" | "currentGameLocationId" | "startingGameLocationId">,
  ) => void | Promise<void>;
  isSaving?: boolean;
  className?: string;
}

function nextLocationId(locations: GameLocation[]) {
  return `location-${locations.length + 1}`;
}

export function GameLocationEditor({ state, onSave, isSaving = false, className }: GameLocationEditorProps) {
  const [locations, setLocations] = useState<GameLocation[]>(state.locations);
  const [links] = useState<GameLocationLink[]>(state.links);
  const [currentGameLocationId, setCurrentGameLocationId] = useState(state.currentGameLocationId);
  const [startingGameLocationId, setStartingGameLocationId] = useState(state.startingGameLocationId ?? null);
  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)),
    [locations],
  );

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--card-foreground)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Game locations</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Edit names and choose the active or starting location.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setLocations((items) => [
              ...items,
              { id: nextLocationId(items), name: "New location", state: "discovered" },
            ])
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
        >
          <Plus size={13} /> Add
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {sortedLocations.map((location) => (
          <div
            key={location.id}
            className="grid gap-2 rounded-xl border border-[var(--border)] p-3 md:grid-cols-[1fr_auto_auto]"
          >
            <input
              value={location.name}
              onChange={(event) =>
                setLocations((items) =>
                  items.map((item) => (item.id === location.id ? { ...item, name: event.target.value } : item)),
                )
              }
              className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
            <label className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <input
                type="radio"
                checked={currentGameLocationId === location.id}
                onChange={() => setCurrentGameLocationId(location.id)}
              />{" "}
              Current
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <input
                type="radio"
                checked={startingGameLocationId === location.id}
                onChange={() => setStartingGameLocationId(location.id)}
              />{" "}
              Start
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={isSaving}
        onClick={() => void onSave({ locations, links, currentGameLocationId, startingGameLocationId })}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
      >
        <Save size={14} /> Save locations
      </button>
    </section>
  );
}
