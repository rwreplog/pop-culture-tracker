import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";

/** Public-facing fields only — never select passwordHash/email here. */
const PUBLIC_COLUMNS = {
  id: true,
  name: true,
  handle: true,
  image: true,
  bio: true,
} as const;

export async function getPublicUserByHandle(handle: string) {
  return db.query.users.findFirst({
    where: eq(users.handle, handle),
    columns: PUBLIC_COLUMNS,
  });
}

export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: PUBLIC_COLUMNS,
  });
}

export async function isHandleTaken(
  handle: string,
  excludingUserId: string,
): Promise<boolean> {
  const existing = await db.query.users.findFirst({
    where: eq(users.handle, handle),
    columns: { id: true },
  });
  return !!existing && existing.id !== excludingUserId;
}
