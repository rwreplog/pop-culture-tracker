import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import type { MediaType } from "@/lib/db/schema/media";
import { libraryItems } from "@/lib/db/schema/library";

type LibraryStatus = (typeof libraryItems.$inferSelect)["status"];

export async function getLibraryItemForUser(userId: string, mediaId: string) {
  return db.query.libraryItems.findFirst({
    where: and(
      eq(libraryItems.userId, userId),
      eq(libraryItems.mediaId, mediaId),
    ),
  });
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
    queue: items
      .filter((item) => item.status === "want")
      .slice(0, SECTION_LIMIT),
    recentlyCompleted: completed.slice(0, SECTION_LIMIT),
    favorites: items.filter((item) => item.isFavorite).slice(0, SECTION_LIMIT),
  };
}
