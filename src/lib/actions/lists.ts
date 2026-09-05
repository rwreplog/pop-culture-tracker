"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  addItemToListSchema,
  createListSchema,
  deleteListSchema,
  removeItemFromListSchema,
  renameListSchema,
  reorderListItemSchema,
} from "@/lib/schemas/lists";
import {
  addItemToList,
  createList,
  deleteList,
  removeItemFromList,
  renameList,
  reorderListItem,
} from "@/lib/services/lists/mutations";

export type ListActionState = { error?: string } | undefined;

async function requireUserId(): Promise<
  { userId: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };
  return { userId: session.user.id };
}

export async function createListAction(
  _prevState: ListActionState,
  formData: FormData,
): Promise<ListActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = createListSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await createList(
    auth.userId,
    parsed.data.name,
    parsed.data.description,
  );
  if (!result.success) return { error: result.error };

  revalidatePath("/lists");
  redirect(`/lists/${result.listId}`);
}

export async function renameListAction(
  _prevState: ListActionState,
  formData: FormData,
): Promise<ListActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = renameListSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await renameList(
    auth.userId,
    parsed.data.listId,
    parsed.data.name,
    parsed.data.description,
  );
  if (!result.success) return { error: result.error };

  revalidatePath("/lists");
  revalidatePath(`/lists/${parsed.data.listId}`);
}

export async function deleteListAction(
  _prevState: ListActionState,
  formData: FormData,
): Promise<ListActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = deleteListSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await deleteList(auth.userId, parsed.data.listId);
  if (!result.success) return { error: result.error };

  revalidatePath("/lists");
  redirect("/lists");
}

export async function addItemToListAction(
  _prevState: ListActionState,
  formData: FormData,
): Promise<ListActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = addItemToListSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await addItemToList(
    auth.userId,
    parsed.data.listId,
    parsed.data.mediaId,
  );
  if (!result.success) return { error: result.error };

  revalidatePath(`/lists/${parsed.data.listId}`);
  revalidatePath("/lists");
}

export async function removeItemFromListAction(
  _prevState: ListActionState,
  formData: FormData,
): Promise<ListActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = removeItemFromListSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: "Invalid request." };

  const result = await removeItemFromList(
    auth.userId,
    parsed.data.listId,
    parsed.data.listItemId,
  );
  if (!result.success) return { error: result.error };

  revalidatePath(`/lists/${parsed.data.listId}`);
  revalidatePath("/lists");
}

export async function reorderListItemAction(
  _prevState: ListActionState,
  formData: FormData,
): Promise<ListActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = reorderListItemSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: "Invalid request." };

  const result = await reorderListItem(
    auth.userId,
    parsed.data.listId,
    parsed.data.listItemId,
    parsed.data.direction,
  );
  if (!result.success) return { error: result.error };

  revalidatePath(`/lists/${parsed.data.listId}`);
}
