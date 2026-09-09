"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { sendRecommendationSchema } from "@/lib/schemas/recommendations";
import { sendRecommendation } from "@/lib/services/recommendations/mutations";

export type RecommendationActionState = { error?: string } | undefined;

async function requireUserId(): Promise<
  { userId: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };
  return { userId: session.user.id };
}

export async function recommendMediaAction(
  _prevState: RecommendationActionState,
  formData: FormData,
): Promise<RecommendationActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = sendRecommendationSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: "Invalid request." };

  const result = await sendRecommendation(
    auth.userId,
    parsed.data.recipientId,
    parsed.data.mediaId,
    parsed.data.note,
  );
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${parsed.data.mediaId}`);
}
