import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { hashPassword, verifyPassword } from "@/lib/services/auth/password";
import type { ChangePasswordInput } from "@/lib/schemas/auth";

export type ChangePasswordResult =
  { success: true } | { success: false; error: string };

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return {
      success: false,
      error: "This account doesn't use a password.",
    };
  }

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(input.newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

  return { success: true };
}
