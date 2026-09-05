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
