"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { isRateLimited, recordFailedAttempt } from "@/lib/auth/rate-limit";
import {
  appearanceSchema,
  type AppearanceInput,
} from "@/lib/schemas/appearance";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { seriesGroupingModeSchema } from "@/lib/schemas/series";
import { changePassword } from "@/lib/services/auth/change-password";
import {
  updateAppearance,
  updateSeriesGroupingMode,
} from "@/lib/services/users/mutations";

export type ChangePasswordActionState =
  { error?: string; success?: boolean } | undefined;

export async function changePasswordAction(
  _prevState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const rateLimitKey = `change-password:${session.user.id}`;
  if (isRateLimited(rateLimitKey)) {
    return { error: "Too many attempts. Try again in a minute." };
  }

  const result = await changePassword(session.user.id, parsed.data);
  if (!result.success) {
    recordFailedAttempt(rateLimitKey);
    return { error: result.error };
  }

  return { success: true };
}

export async function updateAppearanceAction(
  input: AppearanceInput,
): Promise<{ error?: string } | undefined> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = appearanceSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid appearance settings." };

  await updateAppearance(session.user.id, parsed.data);
  revalidatePath("/", "layout");
}

export async function updateSeriesGroupingModeAction(
  input: { mode: string },
): Promise<{ error?: string } | undefined> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = seriesGroupingModeSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid selection." };

  await updateSeriesGroupingMode(session.user.id, parsed.data.mode);
  revalidatePath("/", "layout");
}
