"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  removeFriendshipSchema,
  respondFriendRequestSchema,
  sendFriendRequestSchema,
} from "@/lib/schemas/friendships";
import {
  removeFriendship,
  respondToFriendRequest,
  sendFriendRequest,
} from "@/lib/services/friendships/mutations";

export type FriendshipActionState = { error?: string } | undefined;

async function requireUserId(): Promise<
  { userId: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };
  return { userId: session.user.id };
}

export async function sendFriendRequestAction(
  _prevState: FriendshipActionState,
  formData: FormData,
): Promise<FriendshipActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = sendFriendRequestSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await sendFriendRequest(auth.userId, parsed.data.handle);
  if (!result.success) return { error: result.error };

  revalidatePath("/friends");
  revalidatePath(`/u/${parsed.data.handle}`);
}

export async function respondFriendRequestAction(
  _prevState: FriendshipActionState,
  formData: FormData,
): Promise<FriendshipActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = respondFriendRequestSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: "Invalid request." };

  const result = await respondToFriendRequest(
    auth.userId,
    parsed.data.friendshipId,
    parsed.data.accept,
  );
  if (!result.success) return { error: result.error };

  revalidatePath("/friends");
}

export async function removeFriendshipAction(
  _prevState: FriendshipActionState,
  formData: FormData,
): Promise<FriendshipActionState> {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const parsed = removeFriendshipSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };

  const result = await removeFriendship(auth.userId, parsed.data.friendshipId);
  if (!result.success) return { error: result.error };

  revalidatePath("/friends");
}
