import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import type { MediaType } from "@/lib/db/schema/media";
import { mediaExternalIds } from "@/lib/db/schema/media";
import { libraryItems } from "@/lib/db/schema/library";
import { getMediaGenres } from "@/lib/media/metadata";
import { rankBacklog } from "@/lib/services/recommendations/scoring";

type LibraryStatus = (typeof libraryItems.$inferSelect)["status"];

export async function getLibraryItemForUser(userId: string, mediaId: string) {
  return db.query.libraryItems.findFirst({
    where: and(
      eq(libraryItems.userId, userId),
      eq(libraryItems.mediaId, mediaId),
    ),
  });
}

/**
 * Given a batch of (provider, externalId) pairs from a fresh search — not
 * yet resolved to Media rows — returns the subset already in the user's
 * library, keyed as "provider:externalId". Lets Discover show "already
 * added" without waiting for getOrCreateMedia to run.
 */
export async function getLibraryStatusForResults(
  userId: string,
  results: { provider: string; externalId: string }[],
): Promise<Set<string>> {
  if (results.length === 0) return new Set();

  const rows = await db
    .select({
      provider: mediaExternalIds.provider,
      externalId: mediaExternalIds.externalId,
    })
    .from(mediaExternalIds)
    .innerJoin(libraryItems, eq(libraryItems.mediaId, mediaExternalIds.mediaId))
    .where(
      and(
        eq(libraryItems.userId, userId),
        inArray(
          mediaExternalIds.externalId,
          results.map((result) => result.externalId),
        ),
      ),
    );

  return new Set(rows.map((row) => `${row.provider}:${row.externalId}`));
}

export const LIBRARY_SORTS = [
  "recent",
  "added",
  "title",
  "rating",
  "release",
] as const;
export type LibrarySort = (typeof LIBRARY_SORTS)[number];

export type LibraryFilters = {
  mediaType?: MediaType;
  status?: LibraryStatus;
  /** Case-insensitive substring match against the title. */
  search?: string;
  sort?: LibrarySort;
  wantToOwn?: boolean;
};

function sortItems<
  T extends {
    media: { title: string; releaseDate: string | null };
    rating: number | null;
    createdAt: Date;
    updatedAt: Date;
  },
>(items: T[], sort: LibrarySort = "recent"): T[] {
  const sorted = [...items];
  switch (sort) {
    case "added":
      return sorted.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    case "title":
      return sorted.sort((a, b) => a.media.title.localeCompare(b.media.title));
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "release":
      return sorted.sort((a, b) =>
        (b.media.releaseDate ?? "").localeCompare(a.media.releaseDate ?? ""),
      );
    case "recent":
    default:
      return sorted.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
  }
}

/**
 * Returns the user's library items with their Media joined in, optionally
 * filtered by media type, status, and title search, and sorted. Filtering/
 * sorting happens in application code once fetched — fine at MVP scale (a
 * single user's library), revisit if this needs to scale further.
 */
export async function getLibraryItems(
  userId: string,
  filters: LibraryFilters = {},
) {
  const conditions = [eq(libraryItems.userId, userId)];
  if (filters.status) conditions.push(eq(libraryItems.status, filters.status));
  if (filters.wantToOwn) conditions.push(eq(libraryItems.wantToOwn, true));

  const items = await db.query.libraryItems.findMany({
    where: and(...conditions),
    with: { media: true },
  });

  let result = items;
  if (filters.mediaType) {
    result = result.filter(
      (item) => item.media.mediaType === filters.mediaType,
    );
  }
  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter((item) =>
      item.media.title.toLowerCase().includes(query),
    );
  }
  return sortItems(result, filters.sort);
}

const SECTION_LIMIT = 8;

/**
 * Curated Dashboard sections, derived in application code from the full
 * library — fine at MVP's per-user scale. See docs/UX.md: Home prioritizes
 * continue/queue/recently-completed/favorites over a generic grid.
 */
export async function getDashboardSections(userId: string) {
  const items = await getLibraryItems(userId);

  const completed = items
    .filter((item) => item.status === "completed")
    .sort(
      (a, b) =>
        (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
    );

  const queue = rankBacklog(items).slice(0, SECTION_LIMIT);
  const queuedIds = new Set(queue.map((item) => item.id));

  // "For you": genre-affinity picks not already surfaced in Queue, so the
  // two rails don't just duplicate the same backlog slice.
  const discovery = rankBacklog(items)
    .filter((item) => item.hasGenreMatch && !queuedIds.has(item.id))
    .slice(0, SECTION_LIMIT);

  return {
    continueItems: items
      .filter((item) => item.status === "in_progress")
      .slice(0, SECTION_LIMIT),
    queue,
    recentlyCompleted: completed.slice(0, SECTION_LIMIT),
    favorites: items.filter((item) => item.isFavorite).slice(0, SECTION_LIMIT),
    discovery,
  };
}

const RELATED_LIMIT = 8;

/**
 * Other items of the same media type in the user's library that share a
 * genre tag with `genres`, ranked by number of shared genres. Falls back to
 * same-type items with no genre filter if `genres` is empty, since an
 * empty-genre title still benefits from "more of this type" over nothing.
 */
export async function getRelatedLibraryItems(
  userId: string,
  excludeMediaId: string,
  mediaType: MediaType,
  genres: string[],
) {
  const items = await getLibraryItems(userId, { mediaType });
  const genreSet = new Set(genres);

  const scored = items
    .filter((item) => item.mediaId !== excludeMediaId)
    .map((item) => ({
      item,
      shared: getMediaGenres(item.media).filter((genre) => genreSet.has(genre))
        .length,
    }));

  const relevant =
    genreSet.size > 0 ? scored.filter(({ shared }) => shared > 0) : scored;
  relevant.sort((a, b) => b.shared - a.shared);

  return relevant.slice(0, RELATED_LIMIT).map(({ item }) => item);
}
