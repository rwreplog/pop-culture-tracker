import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { lists } from "@/lib/db/schema/lists";

export async function getListsForUser(userId: string) {
  return db.query.lists.findMany({
    where: eq(lists.userId, userId),
    with: {
      items: {
        with: { media: true },
        orderBy: (item, { asc }) => [asc(item.position)],
      },
    },
    orderBy: (list, { desc }) => [desc(list.updatedAt)],
  });
}

export async function getListForUser(userId: string, listId: string) {
  return db.query.lists.findFirst({
    where: and(eq(lists.id, listId), eq(lists.userId, userId)),
    with: {
      items: {
        with: { media: true },
        orderBy: (item, { asc }) => [asc(item.position)],
      },
    },
  });
}

/**
 * A list by id, viewable when the viewer owns it or it's public — used by
 * the list detail page so a public list's URL also works for non-owners
 * (read-only; see the page for how owner-only controls are gated).
 */
export async function getListForViewer(viewerId: string, listId: string) {
  const list = await db.query.lists.findFirst({
    where: eq(lists.id, listId),
    with: {
      items: {
        with: { media: true },
        orderBy: (item, { asc }) => [asc(item.position)],
      },
    },
  });
  if (!list) return null;
  if (list.userId !== viewerId && !list.isPublic) return null;
  return list;
}

/** A user's lists marked public, for display on their public profile (/u/[handle]). */
export async function getPublicListsForUser(userId: string) {
  return db.query.lists.findMany({
    where: and(eq(lists.userId, userId), eq(lists.isPublic, true)),
    with: {
      items: {
        with: { media: true },
        orderBy: (item, { asc }) => [asc(item.position)],
      },
    },
    orderBy: (list, { desc }) => [desc(list.updatedAt)],
  });
}
