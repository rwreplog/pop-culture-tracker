"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { seriesGroupingModeEnum } from "@/lib/db/schema/users";
import { updateSeriesGroupingModeAction } from "@/lib/actions/settings";

type SeriesGroupingMode = (typeof seriesGroupingModeEnum.enumValues)[number];

const MODE_LABELS: Record<SeriesGroupingMode, string> = {
  grouped: "Grouped",
  unified: "Unified",
};

const MODE_DESCRIPTIONS: Record<SeriesGroupingMode, string> = {
  grouped:
    "Each book/movie/comic in a series keeps its own status, rating, and notes — 2 or more in your library collapse into one summary card.",
  unified:
    "Adding a series member adds the series itself, tracked like a TV show's season/episode — one status and rating for the whole set.",
};

export function SeriesGroupingForm({
  initialMode,
}: {
  initialMode: SeriesGroupingMode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);

  async function handleChange(next: SeriesGroupingMode) {
    setMode(next);
    await updateSeriesGroupingModeAction({ mode: next });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">Series grouping</span>
      <Select
        value={mode}
        onValueChange={(value) => {
          if (value) void handleChange(value as SeriesGroupingMode);
        }}
      >
        <SelectTrigger aria-label="Series grouping" className="w-full sm:w-56">
          <SelectValue>
            {(value: SeriesGroupingMode) => MODE_LABELS[value]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(MODE_LABELS) as SeriesGroupingMode[]).map((value) => (
            <SelectItem key={value} value={value}>
              {MODE_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-xs">{MODE_DESCRIPTIONS[mode]}</p>
    </div>
  );
}
