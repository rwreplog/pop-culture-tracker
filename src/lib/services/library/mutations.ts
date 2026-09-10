import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { libraryItems } from "@/lib/db/schema/library";
import { media } from "@/lib/db/schema/media";
import { users } from "@/lib/db/schema/users";
import type { LibraryProgress } from "@/lib/schemas/library";
import { recordActivity } from "@/lib/services/activity/log";
import { notifyGoalAchievements } from "@/lib/services/goals/achievements";
import { deleteCustomArt } from "@/lib/storage/custom-art";

type LibraryStatus = (typeof libraryItems.$inferSelect)["status"];

export type LibraryMutationResult =
  | { success: true; libraryItemId: string; mediaId: string }
  | { success: false; error: string };

/**
 * Adds a media item to the user's library. Idempotent: if it's already
 * there (unique on userId+mediaId, per docs/DATA_MODEL.md), returns the
 * existing row instead of erroring.
 *
 * In "unified" series-grouping mode, adding a series member (a media row
 * with `seriesId` set) adds the series itself instead — one library item
 * for the whole set, with `seriesCurrentPosition` set to this member's
 * position. Adding a *second* member of a series you already have in
 * unified mode is a no-op here (same idempotency as any other repeat
 * add) rather than advancing the position — "Currently on" in
 * LibraryControls is the explicit way to move it forward, so re-adding
 * never silently jumps your progress.
 */
export async function addToLibrary(
  userId: string,
  mediaId: string,
  status: LibraryStatus,
): Promise<LibraryMutationResult> {
  const now = new Date();
  try {
    return await db.transaction(async (tx) => {
      const item = await tx.query.media.findFirst({
        where: eq(media.id, mediaId),
        columns: { seriesId: true, seriesPosition: true },
      });

      let targetMediaId = mediaId;
      let seriesCurrentPosition: number | undefined;
      if (item?.seriesId) {
        const user = await tx.query.users.findFirst({
          where: eq(users.id, userId),
          columns: { seriesGroupingMode: true },
        });
        if (user?.seriesGroupingMode === "unified") {
          targetMediaId = item.seriesId;
          seriesCurrentPosition = item.seriesPosition ?? undefined;
        }
      }

      const [inserted] = await tx
        .insert(libraryItems)
        .values({
          userId,
          mediaId: targetMediaId,
          status,
          seriesCurrentPosition,
          startedAt: status === "in_progress" ? now : undefined,
          completedAt: status === "completed" ? now : undefined,
        })
        .onConflictDoNothing({
          target: [libraryItems.userId, libraryItems.mediaId],
        })
        .returning({ id: libraryItems.id });

      if (!inserted) {
        const existing = await tx.query.libraryItems.findFirst({
          where: and(
            eq(libraryItems.userId, userId),
            eq(libraryItems.mediaId, targetMediaId),
          ),
        });
        if (!existing) {
          return {
            success: false,
            error: "Couldn't add this item right now.",
          };
        }
        return { success: true, libraryItemId: existing.id, mediaId: targetMediaId };
      }

      await recordActivity(tx, userId, "added", targetMediaId, { status });
      if (status === "in_progress") {
        await recordActivity(tx, userId, "started", targetMediaId);
      }
      if (status === "completed") {
        await recordActivity(tx, userId, "completed", targetMediaId);
        await notifyGoalAchievements(tx, userId, now.getFullYear());
      }

      return { success: true, libraryItemId: inserted.id, mediaId: targetMediaId };
    });
  } catch {
    return { success: false, error: "Couldn't add this item right now." };
  }
}

export type LibraryItemPatch = {
  status?: LibraryStatus;
  rating?: number | null;
  isFavorite?: boolean;
  notes?: string | null;
  progress?: LibraryProgress | null;
  completedAt?: Date | null;
  /** "Unified" series-grouping mode only — see library.ts's schema comment. */
  seriesCurrentPosition?: number;
};

/**
 * Applies a partial update to a library item, re-checking ownership
 * server-side (never trust a client-supplied user id, per docs/SECURITY.md),
 * and logs the activity events implied by the change.
 */
export async function updateLibraryItem(
  userId: string,
  libraryItemId: string,
  patch: LibraryItemPatch,
): Promise<LibraryMutationResult> {
  try {
    return await db.transaction(async (tx) => {
      const existing = await tx.query.libraryItems.findFirst({
        where: and(
          eq(libraryItems.id, libraryItemId),
          eq(libraryItems.userId, userId),
        ),
      });
      if (!existing) {
        return { success: false, error: "That item couldn't be found." };
      }

      const now = new Date();
      const updates: Partial<typeof libraryItems.$inferInsert> = {
        updatedAt: now,
      };

      const statusChanged =
        patch.status !== undefined && patch.status !== existing.status;
      if (statusChanged) {
        updates.status = patch.status;
        if (patch.status === "in_progress" && !existing.startedAt) {
          updates.startedAt = now;
        }
        if (patch.status === "completed") {
          updates.completedAt = now;
        }
      }
      if (patch.rating !== undefined) updates.rating = patch.rating;
      if (patch.isFavorite !== undefined) updates.isFavorite = patch.isFavorite;
      if (patch.notes !== undefined) updates.notes = patch.notes;
      if (patch.progress !== undefined) updates.progress = patch.progress;
      if (patch.seriesCurrentPosition !== undefined) {
        updates.seriesCurrentPosition = patch.seriesCurrentPosition;
      }
      // Explicit completedAt overrides the auto-stamp above, e.g. backdating.
      if (patch.completedAt !== undefined)
        updates.completedAt = patch.completedAt;

      await tx
        .update(libraryItems)
        .set(updates)
        .where(eq(libraryItems.id, libraryItemId));

      if (statusChanged && patch.status === "in_progress") {
        await recordActivity(tx, userId, "started", existing.mediaId);
      }
      if (statusChanged && patch.status === "completed") {
        await recordActivity(tx, userId, "completed", existing.mediaId);
        await notifyGoalAchievements(tx, userId, now.getFullYear());
      }
      if (patch.rating !== undefined && patch.rating !== existing.rating) {
        await recordActivity(tx, userId, "rated", existing.mediaId, {
          rating: patch.rating,
        });
      }
      if (patch.progress !== undefined) {
        await recordActivity(tx, userId, "updated_progress", existing.mediaId, {
          progress: patch.progress,
        });
      }

      return { success: true, libraryItemId, mediaId: existing.mediaId };
    });
  } catch {
    return { success: false, error: "Couldn't update this item right now." };
  }
}

export type RemoveFromLibraryResult =
  { success: true; mediaId: string } | { success: false; error: string };

/** Removes a library item. Never deletes the canonical Media row. */
export async function removeFromLibrary(
  userId: string,
  libraryItemId: string,
): Promise<RemoveFromLibraryResult> {
  const removed = await db
    .delete(libraryItems)
    .where(
      and(eq(libraryItems.id, libraryItemId), eq(libraryItems.userId, userId)),
    )
    .returning({ id: libraryItems.id, mediaId: libraryItems.mediaId });

  if (removed.length === 0) {
    return { success: false, error: "That item couldn't be found." };
  }
  return { success: true, mediaId: removed[0].mediaId };
}

/**
 * Sets a library item's custom art override, deleting the previous object
 * (if any) once ownership is confirmed.
 */
export async function setCustomArt(
  userId: string,
  libraryItemId: string,
  key: string,
): Promise<LibraryMutationResult> {
  const existing = await db.query.libraryItems.findFirst({
    where: and(
      eq(libraryItems.id, libraryItemId),
      eq(libraryItems.userId, userId),
    ),
  });
  if (!existing) {
    return { success: false, error: "That item couldn't be found." };
  }

  await db
    .update(libraryItems)
    .set({ customImageKey: key, updatedAt: new Date() })
    .where(eq(libraryItems.id, libraryItemId));

  if (existing.customImageKey) {
    await deleteCustomArt(existing.customImageKey);
  }

  return { success: true, libraryItemId, mediaId: existing.mediaId };
}

/** Clears a library item's custom art override and deletes the object. */
export async function clearCustomArt(
  userId: string,
  libraryItemId: string,
): Promise<LibraryMutationResult> {
  const existing = await db.query.libraryItems.findFirst({
    where: and(
      eq(libraryItems.id, libraryItemId),
      eq(libraryItems.userId, userId),
    ),
  });
  if (!existing) {
    return { success: false, error: "That item couldn't be found." };
  }

  await db
    .update(libraryItems)
    .set({ customImageKey: null, updatedAt: new Date() })
    .where(eq(libraryItems.id, libraryItemId));

  if (existing.customImageKey) {
    await deleteCustomArt(existing.customImageKey);
  }

  return { success: true, libraryItemId, mediaId: existing.mediaId };
}
