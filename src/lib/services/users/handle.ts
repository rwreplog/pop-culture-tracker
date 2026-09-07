import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";

const FALLBACK_SEED = "user";

/** Lowercases and strips a seed string down to a valid, if not yet unique, handle. */
export function slugifyHandle(seed: string): string {
  const slug = seed
    .toLowerCase()
    .replace(/@.*/, "") // if given a full email, keep only the local part
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  return slug || FALLBACK_SEED;
}

/**
 * Slugifies `seed` (typically a name or email) into a handle, appending
 * `-2`, `-3`, etc. until it's unique. Used right after account creation for
 * both sign-up paths (see users.ts's `handle` column comment).
 */
export async function generateUniqueHandle(seed: string): Promise<string> {
  const base = slugifyHandle(seed);

  for (let suffix = 0; ; suffix++) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const existing = await db.query.users.findFirst({
      where: eq(users.handle, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
  }
}
