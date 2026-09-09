import { and, eq, isNull } from "drizzle-orm";

import type { Transaction } from "@/lib/db";
import { goals } from "@/lib/db/schema/goals";
import { libraryItems } from "@/lib/db/schema/library";
import { computeGoalProgress } from "@/lib/services/goals/progress";
import { createGoalAchievedNotification } from "@/lib/services/notifications/mutations";

/**
 * Called after a library item is marked completed, inside the same
 * transaction. Checks the user's not-yet-celebrated goals for `year` and
 * fires a notification for any that this completion pushed to (or past)
 * its target — `achievedNotifiedAt` ensures a goal is only ever celebrated
 * once, even though progress itself is recomputed fresh on every read.
 */
export async function notifyGoalAchievements(
  tx: Transaction,
  userId: string,
  year: number,
): Promise<void> {
  const candidates = await tx.query.goals.findMany({
    where: and(
      eq(goals.userId, userId),
      eq(goals.year, year),
      isNull(goals.achievedNotifiedAt),
    ),
  });
  if (candidates.length === 0) return;

  const items = await tx.query.libraryItems.findMany({
    where: and(
      eq(libraryItems.userId, userId),
      eq(libraryItems.status, "completed"),
    ),
    with: { media: true },
  });

  for (const goal of candidates) {
    if (computeGoalProgress(items, goal) >= goal.target) {
      await tx
        .update(goals)
        .set({ achievedNotifiedAt: new Date() })
        .where(eq(goals.id, goal.id));
      await createGoalAchievedNotification(tx, { userId, goalId: goal.id });
    }
  }
}
