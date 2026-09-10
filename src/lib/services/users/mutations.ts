import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import type {
  accentColorEnum,
  fontFamilyEnum,
  seriesGroupingModeEnum,
  themeEnum,
} from "@/lib/db/schema/users";
import { isHandleTaken } from "@/lib/services/users/queries";

export type SimpleResult =
  { success: true } | { success: false; error: string };

export async function updateAppearance(
  userId: string,
  appearance: {
    theme: (typeof themeEnum.enumValues)[number];
    accentColor: (typeof accentColorEnum.enumValues)[number];
    fontFamily: (typeof fontFamilyEnum.enumValues)[number];
  },
): Promise<void> {
  await db.update(users).set(appearance).where(eq(users.id, userId));
}

export async function updateSeriesGroupingMode(
  userId: string,
  mode: (typeof seriesGroupingModeEnum.enumValues)[number],
): Promise<void> {
  await db
    .update(users)
    .set({ seriesGroupingMode: mode })
    .where(eq(users.id, userId));
}

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
