"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/schemas/profile";
import { updateProfile } from "@/lib/services/users/mutations";

export type ProfileActionState = { error?: string } | undefined;

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = updateProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await updateProfile(
    session.user.id,
    parsed.data.handle,
    parsed.data.bio,
  );
  if (!result.success) return { error: result.error };

  revalidatePath("/profile");
  revalidatePath(`/u/${parsed.data.handle}`);
}
