import { and, eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { friendships } from "@/lib/db/schema/friendships";

/** Never join in passwordHash/email through these relations. */
const PUBLIC_USER_COLUMNS = {
  id: true,
  name: true,
  handle: true,
  image: true,
  bio: true,
} as const;

export type FriendshipStatus =
  | { state: "none" }
  | { state: "friends"; friendshipId: string }
  | { state: "requested_by_you"; friendshipId: string }
  | { state: "requested_by_them"; friendshipId: string };

/** The relationship between two users, from `viewerId`'s point of view. */
export async function getFriendshipStatus(
  viewerId: string,
  otherUserId: string,
): Promise<FriendshipStatus> {
  const row = await db.query.friendships.findFirst({
    where: or(
      and(
        eq(friendships.requesterId, viewerId),
        eq(friendships.addresseeId, otherUserId),
      ),
      and(
        eq(friendships.requesterId, otherUserId),
        eq(friendships.addresseeId, viewerId),
      ),
    ),
  });

  if (!row) return { state: "none" };
  if (row.status === "accepted") {
    return { state: "friends", friendshipId: row.id };
  }
  return row.requesterId === viewerId
    ? { state: "requested_by_you", friendshipId: row.id }
    : { state: "requested_by_them", friendshipId: row.id };
}

/** Accepted friendships involving `userId`, with the other user's public fields joined in. */
export async function getFriends(userId: string) {
  const rows = await db.query.friendships.findMany({
    where: and(
      eq(friendships.status, "accepted"),
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId),
      ),
    ),
    with: {
      requester: { columns: PUBLIC_USER_COLUMNS },
      addressee: { columns: PUBLIC_USER_COLUMNS },
    },
  });

  return rows.map((row) => ({
    friendshipId: row.id,
    friend: row.requesterId === userId ? row.addressee : row.requester,
  }));
}

/** Pending requests sent to `userId`, awaiting their response. */
export async function getIncomingRequests(userId: string) {
  const rows = await db.query.friendships.findMany({
    where: and(
      eq(friendships.status, "pending"),
      eq(friendships.addresseeId, userId),
    ),
    with: { requester: { columns: PUBLIC_USER_COLUMNS } },
    orderBy: (friendship, { desc }) => [desc(friendship.createdAt)],
  });

  return rows.map((row) => ({
    friendshipId: row.id,
    from: row.requester,
  }));
}

/** Pending requests `userId` sent, awaiting the other person's response. */
export async function getOutgoingRequests(userId: string) {
  const rows = await db.query.friendships.findMany({
    where: and(
      eq(friendships.status, "pending"),
      eq(friendships.requesterId, userId),
    ),
    with: { addressee: { columns: PUBLIC_USER_COLUMNS } },
    orderBy: (friendship, { desc }) => [desc(friendship.createdAt)],
  });

  return rows.map((row) => ({
    friendshipId: row.id,
    to: row.addressee,
  }));
}
