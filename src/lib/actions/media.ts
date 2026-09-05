"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { normalizedSearchResultSchema } from "@/lib/schemas/media";
import { getOrCreateMedia } from "@/lib/services/media/get-or-create";

export type ResolveMediaActionState = { error?: string } | undefined;

/**
 * Resolves a search result (which may not exist in our DB yet) to its
 * canonical Media row, creating it if needed, then redirects to the detail
 * page. Bound to a form of hidden inputs holding the NormalizedSearchResult.
 */
export async function resolveMediaAction(
  _prevState: ResolveMediaActionState,
  formData: FormData,
): Promise<ResolveMediaActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in." };
  }

  const parsed = normalizedSearchResultSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: "That item couldn't be resolved." };
  }

  const result = await getOrCreateMedia(parsed.data);
  if (!result.success) {
    return { error: result.error };
  }

  redirect(`/media/${result.mediaId}`);
}
