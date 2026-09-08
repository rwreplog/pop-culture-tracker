import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { activity } from "@/lib/db/schema/activity";

/** Most recent activity for a user, newest first, with its Media joined in. */
export async function getActivityFeed(userId: string, limit = 50) {
  return db.query.activity.findMany({
    where: eq(activity.userId, userId),
    with: { media: true },
    orderBy: (item, { desc }) => [desc(item.createdAt)],
    limit,
  });
}

/** A user's activity history for one title, newest first. */
export async function getActivityForMedia(
  userId: string,
  mediaId: string,
  limit = 20,
) {
  return db.query.activity.findMany({
    where: and(eq(activity.userId, userId), eq(activity.mediaId, mediaId)),
    with: { media: true },
    orderBy: (item, { desc }) => [desc(item.createdAt)],
    limit,
  });
}
