"use client";

import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const MEDIA_TYPES = ["movie", "tv", "game", "book", "comic"] as const;
const STATUSES = [
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
] as const;
const SORTS = ["recent", "added", "title", "rating", "release"] as const;

const ALL_VALUE = "all";
const DEFAULT_SORT = "recent";

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

function sortLabel(value: string): string {
  switch (value) {
    case "added":
      return "Date added";
    case "title":
      return "Title A–Z";
    case "rating":
      return "Rating";
    case "release":
      return "Release date";
    case "recent":
    default:
      return "Recently updated";
  }
}

function MediaTypeSelect({
  id,
  value,
  onValueChange,
  className,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
    >
      <SelectTrigger id={id} className={className}>
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
  );
}

function StatusSelect({
  id,
  value,
  onValueChange,
  className,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
    >
      <SelectTrigger id={id} className={className}>
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
  );
}

function SortSelect({
  id,
  value,
  onValueChange,
  className,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue>{sortLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SORTS.map((value) => (
          <SelectItem key={value} value={value}>
            {sortLabel(value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "grid" | "list";
  onChange: (value: "grid" | "list") => void;
}) {
  return (
    <div
      className="border-input flex items-center gap-0.5 rounded-full border p-0.5"
      role="group"
      aria-label="View"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-pressed={view === "grid"}
        aria-label="Grid view"
        className={cn(
          "rounded-full",
          view === "grid" && "bg-muted text-foreground",
        )}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-pressed={view === "list"}
        aria-label="List view"
        className={cn(
          "rounded-full",
          view === "list" && "bg-muted text-foreground",
        )}
        onClick={() => onChange("list")}
      >
        <List />
      </Button>
    </div>
  );
}

export function LibraryFilters({
  mediaType,
  status,
  search,
  sort,
  view,
}: {
  mediaType?: string;
  status?: string;
  search?: string;
  sort?: string;
  view?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(search ?? "");
  const isFirstRender = useRef(true);

  // The debounced effect below fires up to 300ms after the keystroke that
  // scheduled it. If another filter changes (via pushParam/setView) inside
  // that window, a `searchParams` value closed over at schedule-time would
  // be stale by the time the debounce fires, and applying it would silently
  // revert that other change. Keep a ref updated on every render so the
  // debounce always reads current params instead.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  function setParam(
    base: URLSearchParams,
    key: string,
    value: string | null,
    defaultValue: string,
  ) {
    const params = new URLSearchParams(base);
    if (!value || value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    return params;
  }

  // Debounce the search box so we're not pushing a navigation on every
  // keystroke; other filters below still update immediately on change.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      const params = setParam(
        searchParamsRef.current,
        "search",
        searchInput.trim(),
        "",
      );
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
    // Only the debounced value should retrigger this — pathname/router are
    // stable, and searchParamsRef.current is read fresh when the timeout
    // fires rather than closed over here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function pushParam(
    key: "mediaType" | "status" | "sort",
    value: string | null,
    defaultValue: string,
  ) {
    if (!value) return;
    const params = setParam(searchParams, key, value, defaultValue);
    router.push(`${pathname}?${params.toString()}`);
  }

  function setView(value: "grid" | "list") {
    const params = setParam(searchParams, "view", value, "grid");
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentView = view === "list" ? "list" : "grid";
  const activeFilterCount = [
    mediaType,
    status,
    sort && sort !== DEFAULT_SORT ? sort : undefined,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">
      <label className="sr-only" htmlFor="library-search">
        Search your library
      </label>
      <Input
        id="library-search"
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search your library…"
        className="max-w-sm"
      />

      {/* Desktop: filters stay inline. */}
      <div
        className="hidden flex-wrap items-center gap-2 sm:flex"
        aria-label="Filter your library"
      >
        <label className="sr-only" htmlFor="filter-media-type">
          Media type
        </label>
        <MediaTypeSelect
          id="filter-media-type"
          value={mediaType || ALL_VALUE}
          onValueChange={(value) => pushParam("mediaType", value, ALL_VALUE)}
        />

        <label className="sr-only" htmlFor="filter-status">
          Status
        </label>
        <StatusSelect
          id="filter-status"
          value={status || ALL_VALUE}
          onValueChange={(value) => pushParam("status", value, ALL_VALUE)}
        />

        <label className="sr-only" htmlFor="library-sort">
          Sort
        </label>
        <SortSelect
          id="library-sort"
          value={sort || DEFAULT_SORT}
          onValueChange={(value) => pushParam("sort", value, DEFAULT_SORT)}
        />

        <div className="ml-auto">
          <ViewToggle view={currentView} onChange={setView} />
        </div>
      </div>

      {/* Mobile: media type/status/sort collapse into a bottom sheet so the
          filter bar doesn't permanently eat screen space most visits never
          touch. Search and the view toggle stay inline — they're the
          highest-use controls. */}
      <div className="flex items-center gap-2 sm:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button type="button" variant="outline" className="gap-1.5" />
            }
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="bg-primary text-primary-foreground inline-flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
                {activeFilterCount}
              </span>
            ) : null}
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-muted-foreground text-xs font-medium"
                  htmlFor="filter-media-type-mobile"
                >
                  Media type
                </label>
                <MediaTypeSelect
                  id="filter-media-type-mobile"
                  className="w-full"
                  value={mediaType || ALL_VALUE}
                  onValueChange={(value) =>
                    pushParam("mediaType", value, ALL_VALUE)
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-muted-foreground text-xs font-medium"
                  htmlFor="filter-status-mobile"
                >
                  Status
                </label>
                <StatusSelect
                  id="filter-status-mobile"
                  className="w-full"
                  value={status || ALL_VALUE}
                  onValueChange={(value) =>
                    pushParam("status", value, ALL_VALUE)
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-muted-foreground text-xs font-medium"
                  htmlFor="library-sort-mobile"
                >
                  Sort
                </label>
                <SortSelect
                  id="library-sort-mobile"
                  className="w-full"
                  value={sort || DEFAULT_SORT}
                  onValueChange={(value) =>
                    pushParam("sort", value, DEFAULT_SORT)
                  }
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose render={<Button className="w-full" />}>
                Done
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <div className="ml-auto">
          <ViewToggle view={currentView} onChange={setView} />
        </div>
      </div>
    </div>
  );
}
