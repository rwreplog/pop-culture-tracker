import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { isHandleTaken } from "@/lib/services/users/queries";

export type SimpleResult =
  { success: true } | { success: false; error: string };

export async function updateProfile(
  userId: string,
  handle: string,
  bio: string | null,
): Promise<SimpleResult> {
  if (await isHandleTaken(handle, userId)) {
    return { success: false, error: "That handle is already taken." };
  }

  try {
    await db.update(users).set({ handle, bio }).where(eq(users.id, userId));
    return { success: true };
  } catch {
    // Unique constraint race: someone else claimed it between the check above and this write.
    return { success: false, error: "That handle is already taken." };
  }
}
