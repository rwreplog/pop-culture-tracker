import { Library } from "lucide-react";
import Link from "next/link";

import { LibraryFilters } from "@/components/library/library-filters";
import { MediaCard } from "@/components/media/media-card";
import { MediaListRow } from "@/components/media/media-list-row";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import type { MediaType } from "@/lib/db/schema/media";
import {
  LIBRARY_SORTS,
  getLibraryItems,
  type LibrarySort,
} from "@/lib/services/library/queries";

const MEDIA_TYPES = new Set<MediaType>([
  "movie",
  "tv",
  "game",
  "book",
  "comic",
]);
const STATUSES = new Set([
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
]);
const SORTS = new Set<string>(LIBRARY_SORTS);

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    mediaType?: string;
    status?: string;
    search?: string;
    sort?: string;
    view?: string;
    wantToOwn?: string;
  }>;
}) {
  const { mediaType, status, search, sort, view, wantToOwn } =
    await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={Library}
        title="Your library"
        description="Sign in to see what you're tracking."
      />
    );
  }

  const items = await getLibraryItems(session.user.id, {
    mediaType: MEDIA_TYPES.has(mediaType as MediaType)
      ? (mediaType as MediaType)
      : undefined,
    status: STATUSES.has(status ?? "")
      ? (status as
          "want" | "in_progress" | "completed" | "paused" | "abandoned")
      : undefined,
    search,
    sort: SORTS.has(sort ?? "") ? (sort as LibrarySort) : undefined,
    wantToOwn: wantToOwn === "true" ? true : undefined,
  });

  const isListView = view === "list";
  const isFiltered = Boolean(
    mediaType || status || search?.trim() || wantToOwn === "true",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Your library</h1>
        <p className="text-muted-foreground text-sm">
          Everything you&apos;re tracking, in one place.
        </p>
      </div>

      <LibraryFilters
        mediaType={mediaType}
        status={status}
        search={search}
        sort={sort}
        view={view}
        wantToOwn={wantToOwn}
      />

      {items.length === 0 ? (
        <PlaceholderScreen
          icon={Library}
          title={isFiltered ? "No matches" : "Nothing here yet"}
          description={
            isFiltered
              ? "Nothing in your library matches these filters."
              : "Search Discover to add movies, shows, games, books, and comics to your library."
          }
          action={
            isFiltered ? undefined : (
              <Link href="/discover" className={buttonVariants()}>
                Go to Discover
              </Link>
            )
          }
        />
      ) : isListView ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <MediaListRow
              key={item.id}
              href={`/media/${item.mediaId}`}
              title={item.media.title}
              mediaType={item.media.mediaType}
              releaseDate={item.media.releaseDate}
              imageUrl={item.media.imageUrl}
              status={item.status}
              rating={item.rating}
              isFavorite={item.isFavorite}
              libraryItemId={item.id}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              href={`/media/${item.mediaId}`}
              title={item.media.title}
              mediaType={item.media.mediaType}
              releaseDate={item.media.releaseDate}
              imageUrl={item.media.imageUrl}
              status={item.status}
              isFavorite={item.isFavorite}
              libraryItemId={item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
