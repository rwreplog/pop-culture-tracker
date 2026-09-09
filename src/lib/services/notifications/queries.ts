import { and, count, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema/notifications";

/** Never join in passwordHash/email through these relations. */
const PUBLIC_USER_COLUMNS = {
  id: true,
  name: true,
  handle: true,
  image: true,
} as const;

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return row?.count ?? 0;
}

/** Most recent notifications for `userId`, with the triggering user's public fields joined in. */
export async function getRecentNotifications(userId: string, limit = 20) {
  const rows = await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    with: {
      actor: { columns: PUBLIC_USER_COLUMNS },
      recommendation: {
        with: { media: { columns: { id: true, title: true } } },
      },
      goal: { columns: { target: true, year: true } },
    },
    orderBy: (notification, { desc }) => [desc(notification.createdAt)],
    limit,
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    actor: row.actor,
    friendshipId: row.friendshipId,
    mediaId: row.recommendation?.media.id ?? null,
    mediaTitle: row.recommendation?.media.title ?? null,
    goalTarget: row.goal?.target ?? null,
    goalYear: row.goal?.year ?? null,
    read: row.readAt !== null,
    createdAt: row.createdAt,
  }));
}
