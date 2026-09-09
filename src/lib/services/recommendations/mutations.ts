import { and, eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { friendships } from "@/lib/db/schema/friendships";
import { recommendations } from "@/lib/db/schema/recommendations";
import { createRecommendationNotification } from "@/lib/services/notifications/mutations";

export type SimpleResult =
  { success: true } | { success: false; error: string };

/**
 * Recommends a media item to a friend. Only accepted friendships can
 * receive one — mirrors the friend-only visibility rule used elsewhere.
 * A duplicate (same recommender/recipient/media) is a silent no-op rather
 * than an error, same idiom as addToLibrary's onConflictDoNothing.
 */
export async function sendRecommendation(
  recommenderId: string,
  recipientId: string,
  mediaId: string,
  note: string | null,
): Promise<SimpleResult> {
  if (recipientId === recommenderId) {
    return {
      success: false,
      error: "You can't recommend something to yourself.",
    };
  }

  const friendship = await db.query.friendships.findFirst({
    where: and(
      eq(friendships.status, "accepted"),
      or(
        and(
          eq(friendships.requesterId, recommenderId),
          eq(friendships.addresseeId, recipientId),
        ),
        and(
          eq(friendships.requesterId, recipientId),
          eq(friendships.addresseeId, recommenderId),
        ),
      ),
    ),
  });
  if (!friendship) {
    return {
      success: false,
      error: "You can only recommend titles to friends.",
    };
  }

  try {
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(recommendations)
        .values({ recommenderId, recipientId, mediaId, note })
        .onConflictDoNothing({
          target: [
            recommendations.recommenderId,
            recommendations.recipientId,
            recommendations.mediaId,
          ],
        })
        .returning({ id: recommendations.id });

      if (inserted) {
        await createRecommendationNotification(tx, {
          userId: recipientId,
          actorId: recommenderId,
          recommendationId: inserted.id,
        });
      }
    });
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Couldn't send the recommendation right now.",
    };
  }
}
