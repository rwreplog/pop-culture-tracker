import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { lists, listItems } from "@/lib/db/schema/lists";
import { recordActivity } from "@/lib/services/activity/log";

export type ListResult =
  | { success: true; listId: string }
  | { success: false; error: string };

export async function createList(
  userId: string,
  name: string,
  description: string | null,
): Promise<ListResult> {
  try {
    const [inserted] = await db
      .insert(lists)
      .values({ userId, name, description })
      .returning({ id: lists.id });
    return { success: true, listId: inserted.id };
  } catch {
    return { success: false, error: "Couldn't create the list right now." };
  }
}

export async function renameList(
  userId: string,
  listId: string,
  name: string,
  description: string | null,
): Promise<ListResult> {
  const updated = await db
    .update(lists)
    .set({ name, description, updatedAt: new Date() })
    .where(and(eq(lists.id, listId), eq(lists.userId, userId)))
    .returning({ id: lists.id });

  if (updated.length === 0) {
    return { success: false, error: "That list couldn't be found." };
  }
  return { success: true, listId };
}

export type SimpleResult = { success: true } | { success: false; error: string };

export async function deleteList(
  userId: string,
  listId: string,
): Promise<SimpleResult> {
  const deleted = await db
    .delete(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, userId)))
    .returning({ id: lists.id });

  if (deleted.length === 0) {
    return { success: false, error: "That list couldn't be found." };
  }
  return { success: true };
}

/** Adds a media item to a list. Idempotent on the (listId, mediaId) unique constraint. */
export async function addItemToList(
  userId: string,
  listId: string,
  mediaId: string,
): Promise<SimpleResult> {
  try {
    return await db.transaction(async (tx) => {
      const list = await tx.query.lists.findFirst({
        where: and(eq(lists.id, listId), eq(lists.userId, userId)),
      });
      if (!list) return { success: false, error: "That list couldn't be found." };

      const [row] = await tx
        .select({ maxPosition: sql<number | null>`max(${listItems.position})` })
        .from(listItems)
        .where(eq(listItems.listId, listId));
      const nextPosition = (row?.maxPosition ?? -1) + 1;

      const [inserted] = await tx
        .insert(listItems)
        .values({ listId, mediaId, position: nextPosition })
        .onConflictDoNothing({
          target: [listItems.listId, listItems.mediaId],
        })
        .returning({ id: listItems.id });

      if (inserted) {
        await recordActivity(tx, userId, "added_to_list", mediaId, {
          listId,
        });
      }

      return { success: true };
    });
  } catch {
    return {
      success: false,
      error: "Couldn't add this item to the list right now.",
    };
  }
}

export async function removeItemFromList(
  userId: string,
  listId: string,
  listItemId: string,
): Promise<SimpleResult> {
  return db.transaction(async (tx) => {
    const list = await tx.query.lists.findFirst({
      where: and(eq(lists.id, listId), eq(lists.userId, userId)),
    });
    if (!list) return { success: false, error: "That list couldn't be found." };

    const deleted = await tx
      .delete(listItems)
      .where(and(eq(listItems.id, listItemId), eq(listItems.listId, listId)))
      .returning({ id: listItems.id });

    if (deleted.length === 0) {
      return { success: false, error: "That item couldn't be found in the list." };
    }
    return { success: true };
  });
}

export async function reorderListItem(
  userId: string,
  listId: string,
  listItemId: string,
  direction: "up" | "down",
): Promise<SimpleResult> {
  return db.transaction(async (tx) => {
    const list = await tx.query.lists.findFirst({
      where: and(eq(lists.id, listId), eq(lists.userId, userId)),
    });
    if (!list) return { success: false, error: "That list couldn't be found." };

    const items = await tx.query.listItems.findMany({
      where: eq(listItems.listId, listId),
      orderBy: (item, { asc }) => [asc(item.position)],
    });

    const index = items.findIndex((item) => item.id === listItemId);
    if (index === -1) {
      return { success: false, error: "That item couldn't be found in the list." };
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) {
      return { success: true }; // already at the edge; no-op
    }

    const current = items[index];
    const swapWith = items[swapIndex];

    await tx
      .update(listItems)
      .set({ position: swapWith.position })
      .where(eq(listItems.id, current.id));
    await tx
      .update(listItems)
      .set({ position: current.position })
      .where(eq(listItems.id, swapWith.id));

    return { success: true };
  });
}
