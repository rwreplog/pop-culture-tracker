"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createGoalSchema, deleteGoalSchema } from "@/lib/schemas/goals";
import { createGoal, deleteGoal } from "@/lib/services/goals/mutations";

export type GoalActionState = { error?: string } | undefined;

async function requireUserId(): Promise<
  { userId: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };
  return { userId: session.user.id };
}

export async function createGoalAction(
  _prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = createGoalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await createGoal(
    auth.userId,
    parsed.data.year,
    parsed.data.target,
    parsed.data.mediaType,
    parsed.data.genre,
  );
  if (!result.success) return { error: result.error };

  revalidatePath("/goals");
}

export async function deleteGoalAction(
  _prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = deleteGoalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await deleteGoal(auth.userId, parsed.data.goalId);
  if (!result.success) return { error: result.error };

  revalidatePath("/goals");
}
