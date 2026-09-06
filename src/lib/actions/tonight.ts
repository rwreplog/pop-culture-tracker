"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  SKIP_COOKIE_MAX_AGE_SECONDS,
  SKIP_COOKIE_NAME,
  addSkip,
} from "@/lib/services/recommendations/skip-memory";

const MEDIA_TYPES = ["movie", "tv", "game", "book", "comic"] as const;

const skipTonightPickSchema = z.object({
  libraryItemId: z.uuid(),
  mediaType: z.enum(MEDIA_TYPES).optional(),
});

/**
 * Records a "show me something else" skip so it's excluded from `/tonight`
 * picks for a few days (see skip-memory.ts), then redirects back.
 */
export async function skipTonightPickAction(formData: FormData) {
  const parsed = skipTonightPickSchema.safeParse({
    libraryItemId: formData.get("libraryItemId"),
    mediaType: formData.get("mediaType") || undefined,
  });

  const query =
    parsed.success && parsed.data.mediaType
      ? `?type=${parsed.data.mediaType}`
      : "";

  if (parsed.success) {
    const cookieStore = await cookies();
    const updated = addSkip(
      cookieStore.get(SKIP_COOKIE_NAME)?.value,
      parsed.data.libraryItemId,
    );
    cookieStore.set(SKIP_COOKIE_NAME, updated, {
      maxAge: SKIP_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  revalidatePath("/tonight");
  redirect(`/tonight${query}`);
}
