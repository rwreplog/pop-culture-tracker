import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import type { MediaType } from "@/lib/db/schema/media";
import { mediaExternalIds } from "@/lib/db/schema/media";
import { libraryItems } from "@/lib/db/schema/library";
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
    .innerJoin(
      libraryItems,
      eq(libraryItems.mediaId, mediaExternalIds.mediaId),
    )
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

export type LibraryFilters = {
  mediaType?: MediaType;
  status?: LibraryStatus;
};

/**
 * Returns the user's library items with their Media joined in, optionally
 * filtered by media type and/or status. Filtering/sorting happens in
 * application code once fetched — fine at MVP scale (a single user's
 * library), revisit if this needs to scale further.
 */
export async function getLibraryItems(
  userId: string,
  filters: LibraryFilters = {},
) {
  const items = await db.query.libraryItems.findMany({
    where: filters.status
      ? and(
          eq(libraryItems.userId, userId),
          eq(libraryItems.status, filters.status),
        )
      : eq(libraryItems.userId, userId),
    with: { media: true },
    orderBy: (item, { desc }) => [desc(item.updatedAt)],
  });

  if (!filters.mediaType) return items;
  return items.filter((item) => item.media.mediaType === filters.mediaType);
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

  return {
    continueItems: items
      .filter((item) => item.status === "in_progress")
      .slice(0, SECTION_LIMIT),
    queue: rankBacklog(items).slice(0, SECTION_LIMIT),
    recentlyCompleted: completed.slice(0, SECTION_LIMIT),
    favorites: items.filter((item) => item.isFavorite).slice(0, SECTION_LIMIT),
  };
}
