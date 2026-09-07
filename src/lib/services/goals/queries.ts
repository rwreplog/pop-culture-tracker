import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema/goals";
import { getLibraryItems } from "@/lib/services/library/queries";
import { computeGoalProgress } from "@/lib/services/goals/progress";

export type GoalWithProgress = typeof goals.$inferSelect & {
  completed: number;
};

/**
 * The user's goals with progress computed from their current library.
 * Fetches the full library once (like getInsights/getDashboardSections)
 * rather than per-goal, since goal counts are typically small.
 */
export async function getGoalsForUser(
  userId: string,
): Promise<GoalWithProgress[]> {
  const [userGoals, items] = await Promise.all([
    db.query.goals.findMany({
      where: eq(goals.userId, userId),
      orderBy: (goal, { desc }) => [desc(goal.year), desc(goal.createdAt)],
    }),
    getLibraryItems(userId),
  ]);

  return userGoals.map((goal) => ({
    ...goal,
    completed: computeGoalProgress(items, goal),
  }));
}
