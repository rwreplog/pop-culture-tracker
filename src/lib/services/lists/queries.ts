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
