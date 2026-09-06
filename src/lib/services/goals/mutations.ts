import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema/goals";
import type { MediaType } from "@/lib/db/schema/media";

export type SimpleResult =
  { success: true } | { success: false; error: string };

export async function createGoal(
  userId: string,
  year: number,
  target: number,
  mediaType: MediaType | null,
  genre: string | null,
): Promise<SimpleResult> {
  try {
    await db.insert(goals).values({ userId, year, target, mediaType, genre });
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't create the goal right now." };
  }
}

export async function deleteGoal(
  userId: string,
  goalId: string,
): Promise<SimpleResult> {
  const deleted = await db
    .delete(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning({ id: goals.id });

  if (deleted.length === 0) {
    return { success: false, error: "That goal couldn't be found." };
  }
  return { success: true };
}
