"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  SKIP_COOKIE_MAX_AGE_SECONDS,
  SKIP_COOKIE_NAME,
  addSkip,
} from "@/lib/services/recommendations/skip-memory";

const skipTonightPickSchema = z.object({
  libraryItemId: z.uuid(),
});

/**
 * Records a "show me something else" skip so it's excluded from `/tonight`
 * picks for a few days (see skip-memory.ts). Deliberately doesn't redirect:
 * the form submits back to the same `/tonight` URL it's already on, and
 * redirect()-ing to the page you're already viewing makes Next.js's client
 * router treat it as a no-op instead of applying the revalidated RSC
 * payload, so the stale pick stays on screen. Leaving the action to just
 * mutate + revalidatePath lets Next's normal post-action refresh pick up
 * the change.
 */
export async function skipTonightPickAction(formData: FormData) {
  const parsed = skipTonightPickSchema.safeParse({
    libraryItemId: formData.get("libraryItemId"),
  });

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
}
