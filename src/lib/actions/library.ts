"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  addToLibrarySchema,
  libraryStatusSchema,
  removeFromLibrarySchema,
  toggleFavoriteSchema,
  updateNotesSchema,
  updateProgressSchema,
  updateRatingSchema,
  updateStatusSchema,
} from "@/lib/schemas/library";
import { normalizedSearchResultSchema } from "@/lib/schemas/media";
import { getOrCreateMedia } from "@/lib/services/media/get-or-create";
import {
  addToLibrary,
  removeFromLibrary,
  updateLibraryItem,
} from "@/lib/services/library/mutations";

export type LibraryActionState = { error?: string } | undefined;

async function requireUserId(): Promise<
  { userId: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };
  return { userId: session.user.id };
}

export async function addToLibraryAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = addToLibrarySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await addToLibrary(
    auth.userId,
    parsed.data.mediaId,
    parsed.data.status,
  );
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${parsed.data.mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

/**
 * Resolves an unresolved search result to its canonical Media row (creating
 * it if needed) and adds it straight to the library, in one action. This is
 * the "Search → Select → Add → Choose status → Done" flow from
 * docs/UX.md, invoked directly from a Discover result card.
 */
export async function quickAddToLibraryAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const raw = Object.fromEntries(formData);
  const parsedResult = normalizedSearchResultSchema.safeParse(raw);
  const parsedStatus = libraryStatusSchema.safeParse(raw.status);
  if (!parsedResult.success || !parsedStatus.success) {
    return { error: "That item couldn't be added." };
  }

  const mediaResult = await getOrCreateMedia(parsedResult.data);
  if (!mediaResult.success) return { error: mediaResult.error };

  const addResult = await addToLibrary(
    auth.userId,
    mediaResult.mediaId,
    parsedStatus.data,
  );
  if (!addResult.success) return { error: addResult.error };

  revalidatePath("/library");
  revalidatePath("/");
}

export async function updateStatusAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await updateLibraryItem(auth.userId, parsed.data.libraryItemId, {
    status: parsed.data.status,
  });
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${result.mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
  revalidatePath("/activity");
}

export async function updateRatingAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = updateRatingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a rating between 0 and 10." };

  const result = await updateLibraryItem(auth.userId, parsed.data.libraryItemId, {
    rating: parsed.data.rating,
  });
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${result.mediaId}`);
  revalidatePath("/activity");
}

export async function toggleFavoriteAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = toggleFavoriteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await updateLibraryItem(auth.userId, parsed.data.libraryItemId, {
    isFavorite: parsed.data.isFavorite,
  });
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${result.mediaId}`);
  revalidatePath("/");
  revalidatePath("/library");
}

export async function updateNotesAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = updateNotesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Notes are too long." };

  const result = await updateLibraryItem(auth.userId, parsed.data.libraryItemId, {
    notes: parsed.data.notes,
  });
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${result.mediaId}`);
}

export async function updateProgressAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const raw = Object.fromEntries(formData);
  const parsed = updateProgressSchema.safeParse({
    libraryItemId: raw.libraryItemId,
    progress: raw,
  });
  if (!parsed.success) return { error: "Invalid progress values." };

  const result = await updateLibraryItem(auth.userId, parsed.data.libraryItemId, {
    progress: parsed.data.progress,
  });
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${result.mediaId}`);
  revalidatePath("/activity");
}

export async function removeFromLibraryAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = removeFromLibrarySchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: "Invalid request." };

  const result = await removeFromLibrary(auth.userId, parsed.data.libraryItemId);
  if (!result.success) return { error: result.error };

  revalidatePath(`/media/${result.mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}
