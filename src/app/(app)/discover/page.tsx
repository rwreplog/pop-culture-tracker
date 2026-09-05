import { Search } from "lucide-react";
import Link from "next/link";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { SearchResultCard } from "@/components/media/search-result-card";
import type { MediaType } from "@/lib/db/schema/media";
import { mediaTypeLabel } from "@/lib/media/labels";
import { searchMedia } from "@/lib/services/media/search";
import { cn } from "@/lib/utils";

const MEDIA_TYPES: MediaType[] = ["movie", "tv", "game", "book", "comic"];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const query = q?.trim() ?? "";
  const mediaType = MEDIA_TYPES.includes(type as MediaType)
    ? (type as MediaType)
    : "movie";

  const result = query
    ? await searchMedia(query, mediaType)
    : { success: true as const, results: [] };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Discover</h1>
        <p className="text-muted-foreground text-sm">
          Search for something to add to your library.
        </p>
      </div>

      <form method="get" className="flex gap-2">
        <input type="hidden" name="type" value={mediaType} />
        <label className="sr-only" htmlFor="discover-query">
          Search
        </label>
        <input
          id="discover-query"
          type="search"
          name="q"
          defaultValue={query}
          placeholder={`Search ${mediaTypeLabel(mediaType).toLowerCase()}s…`}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-3"
        />
        <button
          type="submit"
          className="border-border bg-background hover:bg-muted flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm"
        >
          <Search className="size-4" aria-hidden="true" />
          Search
        </button>
      </form>

      <nav aria-label="Media type" className="flex flex-wrap gap-1">
        {MEDIA_TYPES.map((value) => (
          <Link
            key={value}
            href={`/discover?${new URLSearchParams({ ...(query ? { q: query } : {}), type: value }).toString()}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              value === mediaType
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {mediaTypeLabel(value)}
          </Link>
        ))}
      </nav>

      {!query ? (
        <PlaceholderScreen
          icon={Search}
          title="Search to get started"
          description="Find movies, shows, games, books, and comics to add to your library."
        />
      ) : !result.success ? (
        <PlaceholderScreen
          icon={Search}
          title="Search unavailable"
          description={result.error}
        />
      ) : result.results.length === 0 ? (
        <PlaceholderScreen
          icon={Search}
          title="No results"
          description={`Nothing matched "${query}". Try a different search term.`}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {result.results.map((item) => (
            <SearchResultCard
              key={`${item.provider}:${item.externalId}`}
              result={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
