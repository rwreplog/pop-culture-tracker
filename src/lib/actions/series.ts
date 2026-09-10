"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  addToSeriesSchema,
  createSeriesSchema,
  removeFromSeriesSchema,
  reorderSeriesMemberSchema,
} from "@/lib/schemas/series";
import {
  addToSeries,
  createSeries,
  removeFromSeries,
  reorderSeriesMember,
} from "@/lib/services/series/mutations";

export type SeriesActionState = { error?: string } | undefined;

async function requireUserId(): Promise<
  { userId: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };
  return { userId: session.user.id };
}

/**
 * Creates a series and adds `mediaId` to it as the first member, in one
 * step — the common case when a user is on a media item's page and
 * realizes it doesn't have a series yet.
 */
export async function createSeriesAction(
  _prevState: SeriesActionState,
  formData: FormData,
): Promise<SeriesActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = createSeriesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const created = await createSeries(parsed.data.title, parsed.data.mediaType);
  if (!created.success) return { error: created.error };

  const mediaId = formData.get("mediaId");
  if (typeof mediaId === "string" && mediaId) {
    const added = await addToSeries(mediaId, created.seriesId);
    if (!added.success) return { error: added.error };
    revalidatePath(`/media/${mediaId}`);
  }

  revalidatePath(`/series/${created.seriesId}`);
}

export async function addToSeriesAction(
  _prevState: SeriesActionState,
  formData: FormData,
): Promise<SeriesActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = addToSeriesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await addToSeries(parsed.data.mediaId, parsed.data.seriesId);
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${parsed.data.mediaId}`);
  revalidatePath(`/series/${parsed.data.seriesId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function removeFromSeriesAction(
  _prevState: SeriesActionState,
  formData: FormData,
): Promise<SeriesActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = removeFromSeriesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await removeFromSeries(parsed.data.mediaId);
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${parsed.data.mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function reorderSeriesMemberAction(
  _prevState: SeriesActionState,
  formData: FormData,
): Promise<SeriesActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = reorderSeriesMemberSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: "Invalid request." };

  const result = await reorderSeriesMember(
    parsed.data.seriesId,
    parsed.data.mediaId,
    parsed.data.direction,
  );
  if (!result.success) return { error: result.error };

  revalidatePath(`/series/${parsed.data.seriesId}`);
}
