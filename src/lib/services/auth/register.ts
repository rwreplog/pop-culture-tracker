import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/services/auth/password";
import type { RegisterInput } from "@/lib/schemas/auth";

export type RegisterResult =
  { success: true; userId: string } | { success: false; error: string };

export async function registerUser(
  input: RegisterInput,
): Promise<RegisterResult> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    columns: { id: true },
  });

  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await hashPassword(input.password);

  const [created] = await db
    .insert(users)
    .values({ name: input.name, email: input.email, passwordHash })
    .returning({ id: users.id });

  return { success: true, userId: created.id };
}
