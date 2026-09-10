import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema/media";
import type { MediaType } from "@/lib/db/schema/media";

export type SeriesResult =
  { success: true; seriesId: string } | { success: false; error: string };

export type SimpleResult =
  { success: true } | { success: false; error: string };

/**
 * Creates a series — an ordinary `media` row with no provider link that
 * other `media` rows can point at via `seriesId`. Mirrors `createList`:
 * series membership is canonical (shared across users), the same way
 * `media` itself is, so this isn't scoped to a user the way a List is.
 */
export async function createSeries(
  title: string,
  mediaType: MediaType,
): Promise<SeriesResult> {
  try {
    const [inserted] = await db
      .insert(media)
      .values({ title, mediaType })
      .returning({ id: media.id });
    return { success: true, seriesId: inserted.id };
  } catch {
    return { success: false, error: "Couldn't create the series right now." };
  }
}

/**
 * Adds a media item to a series, appending it at the next position.
 * Any user who has the item in their library may do this — the same
 * trust model as "Refresh details" (see media/refresh.ts), which already
 * lets any user mutate shared canonical `media` rows.
 */
export async function addToSeries(
  mediaId: string,
  seriesId: string,
): Promise<SimpleResult> {
  if (mediaId === seriesId) {
    return { success: false, error: "A series can't contain itself." };
  }

  try {
    return await db.transaction(async (tx) => {
      const [series, item] = await Promise.all([
        tx.query.media.findFirst({ where: eq(media.id, seriesId) }),
        tx.query.media.findFirst({ where: eq(media.id, mediaId) }),
      ]);
      if (!series) {
        return { success: false, error: "That series couldn't be found." };
      }
      if (!item) {
        return { success: false, error: "That item couldn't be found." };
      }
      if (series.mediaType !== item.mediaType) {
        return {
          success: false,
          error: "A series can only contain items of the same type.",
        };
      }

      const [row] = await tx
        .select({
          maxPosition: sql<number | null>`max(${media.seriesPosition})`,
        })
        .from(media)
        .where(eq(media.seriesId, seriesId));
      const nextPosition = (row?.maxPosition ?? 0) + 1;

      await tx
        .update(media)
        .set({ seriesId, seriesPosition: nextPosition, updatedAt: new Date() })
        .where(eq(media.id, mediaId));

      return { success: true };
    });
  } catch {
    return {
      success: false,
      error: "Couldn't add this item to the series right now.",
    };
  }
}

export async function removeFromSeries(mediaId: string): Promise<SimpleResult> {
  const existing = await db.query.media.findFirst({
    where: eq(media.id, mediaId),
    columns: { id: true, seriesId: true },
  });
  if (!existing)
    return { success: false, error: "That item couldn't be found." };
  if (!existing.seriesId) {
    return { success: false, error: "That item isn't part of a series." };
  }

  await db
    .update(media)
    .set({ seriesId: null, seriesPosition: null, updatedAt: new Date() })
    .where(eq(media.id, mediaId));
  return { success: true };
}

export async function reorderSeriesMember(
  seriesId: string,
  mediaId: string,
  direction: "up" | "down",
): Promise<SimpleResult> {
  return db.transaction(async (tx) => {
    const members = await tx.query.media.findMany({
      where: eq(media.seriesId, seriesId),
      orderBy: (item, { asc }) => [asc(item.seriesPosition)],
    });

    const index = members.findIndex((item) => item.id === mediaId);
    if (index === -1) {
      return {
        success: false,
        error: "That item couldn't be found in the series.",
      };
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= members.length) {
      return { success: true }; // already at the edge; no-op
    }

    const current = members[index];
    const swapWith = members[swapIndex];

    await tx
      .update(media)
      .set({ seriesPosition: swapWith.seriesPosition })
      .where(eq(media.id, current.id));
    await tx
      .update(media)
      .set({ seriesPosition: current.seriesPosition })
      .where(eq(media.id, swapWith.id));

    return { success: true };
  });
}
