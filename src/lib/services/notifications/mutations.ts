import { and, eq, isNull } from "drizzle-orm";

import { db, type Transaction } from "@/lib/db";
import { notifications } from "@/lib/db/schema/notifications";

export async function createFriendRequestNotification(
  tx: Transaction,
  {
    userId,
    actorId,
    friendshipId,
  }: {
    userId: string;
    actorId: string;
    friendshipId: string;
  },
) {
  await tx.insert(notifications).values({
    userId,
    actorId,
    type: "friend_request",
    friendshipId,
  });
}

/** Called when a friendship row is updated (not deleted) — accept and auto-accept. */
export async function deleteNotificationForFriendship(
  tx: Transaction,
  friendshipId: string,
) {
  await tx
    .delete(notifications)
    .where(eq(notifications.friendshipId, friendshipId));
}

export async function markAllRead(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
