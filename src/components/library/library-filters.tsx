"use client";

const MEDIA_TYPES = ["movie", "tv", "game", "book", "comic"] as const;
const STATUSES = [
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
] as const;

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3";

export function LibraryFilters({
  mediaType,
  status,
}: {
  mediaType?: string;
  status?: string;
}) {
  return (
    <form
      method="get"
      className="flex flex-wrap items-center gap-2"
      aria-label="Filter your library"
    >
      <label className="sr-only" htmlFor="filter-media-type">
        Media type
      </label>
      <select
        id="filter-media-type"
        name="mediaType"
        defaultValue={mediaType ?? ""}
        className={selectClassName}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">All types</option>
        {MEDIA_TYPES.map((type) => (
          <option key={type} value={type}>
            {type === "tv" ? "TV" : type[0].toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-status">
        Status
      </label>
      <select
        id="filter-status"
        name="status"
        defaultValue={status ?? ""}
        className={selectClassName}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">All statuses</option>
        {STATUSES.map((value) => (
          <option key={value} value={value}>
            {value
              .split("_")
              .map((word) => word[0].toUpperCase() + word.slice(1))
              .join(" ")}
          </option>
        ))}
      </select>
    </form>
  );
}
