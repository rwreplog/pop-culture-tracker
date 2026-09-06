"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MEDIA_TYPES = ["movie", "tv", "game", "book", "comic"] as const;
const STATUSES = [
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
] as const;

const ALL_VALUE = "all";

function mediaTypeLabel(type: string): string {
  if (type === ALL_VALUE) return "All types";
  return type === "tv" ? "TV" : type[0].toUpperCase() + type.slice(1);
}

function statusLabel(value: string): string {
  if (value === ALL_VALUE) return "All statuses";
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function LibraryFilters({
  mediaType,
  status,
}: {
  mediaType?: string;
  status?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: "mediaType" | "status", value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    if (value === ALL_VALUE) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="Filter your library"
    >
      <label className="sr-only" htmlFor="filter-media-type">
        Media type
      </label>
      <Select
        value={mediaType || ALL_VALUE}
        onValueChange={(value) => setParam("mediaType", value)}
      >
        <SelectTrigger id="filter-media-type">
          <SelectValue>{mediaTypeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All types</SelectItem>
          {MEDIA_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {mediaTypeLabel(type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label className="sr-only" htmlFor="filter-status">
        Status
      </label>
      <Select
        value={status || ALL_VALUE}
        onValueChange={(value) => setParam("status", value)}
      >
        <SelectTrigger id="filter-status">
          <SelectValue>{statusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
          {STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {statusLabel(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
