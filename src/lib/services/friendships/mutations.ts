import { and, eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { friendships } from "@/lib/db/schema/friendships";
import { users } from "@/lib/db/schema/users";

export type SimpleResult =
  { success: true } | { success: false; error: string };

/**
 * Sends a friend request by handle. A no-op unique constraint on
 * (requesterId, addresseeId) doesn't catch the reverse pair (the other
 * person already requested you), so that's checked here explicitly —
 * accepting their existing request instead of creating a duplicate.
 */
export async function sendFriendRequest(
  requesterId: string,
  targetHandle: string,
): Promise<SimpleResult> {
  const target = await db.query.users.findFirst({
    where: eq(users.handle, targetHandle),
    columns: { id: true },
  });
  if (!target) return { success: false, error: "No user with that handle." };
  if (target.id === requesterId) {
    return { success: false, error: "You can't friend yourself." };
  }

  const existing = await db.query.friendships.findFirst({
    where: or(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.addresseeId, target.id),
      ),
      and(
        eq(friendships.requesterId, target.id),
        eq(friendships.addresseeId, requesterId),
      ),
    ),
  });

  if (existing?.status === "accepted") {
    return { success: false, error: "You're already friends." };
  }
  if (existing) {
    if (existing.requesterId === requesterId) {
      return { success: false, error: "Request already sent." };
    }
    // They'd already requested you — accept theirs instead of duplicating.
    await db
      .update(friendships)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(friendships.id, existing.id));
    return { success: true };
  }

  try {
    await db
      .insert(friendships)
      .values({ requesterId, addresseeId: target.id });
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't send the request right now." };
  }
}

export async function respondToFriendRequest(
  userId: string,
  friendshipId: string,
  accept: boolean,
): Promise<SimpleResult> {
  if (!accept) {
    const deleted = await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.id, friendshipId),
          eq(friendships.addresseeId, userId),
          eq(friendships.status, "pending"),
        ),
      )
      .returning({ id: friendships.id });
    if (deleted.length === 0) {
      return { success: false, error: "That request couldn't be found." };
    }
    return { success: true };
  }

  const updated = await db
    .update(friendships)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(
      and(
        eq(friendships.id, friendshipId),
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending"),
      ),
    )
    .returning({ id: friendships.id });

  if (updated.length === 0) {
    return { success: false, error: "That request couldn't be found." };
  }
  return { success: true };
}

/** Cancels an outgoing request, or ends an accepted friendship — either way, from either side. */
export async function removeFriendship(
  userId: string,
  friendshipId: string,
): Promise<SimpleResult> {
  const deleted = await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    )
    .returning({ id: friendships.id });

  if (deleted.length === 0) {
    return { success: false, error: "That friendship couldn't be found." };
  }
  return { success: true };
}
