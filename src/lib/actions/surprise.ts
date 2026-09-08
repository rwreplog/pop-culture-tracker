"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  SKIP_COOKIE_MAX_AGE_SECONDS,
  SURPRISE_SKIP_COOKIE_NAME,
  addSkip,
} from "@/lib/services/recommendations/skip-memory";

const skipSurprisePickSchema = z.object({
  provider: z.string().min(1),
  externalId: z.string().min(1),
});

/**
 * Records a "show me something else" skip so it's excluded from
 * `/surprise` picks for a few days (see skip-memory.ts). Mirrors
 * skipTonightPickAction: no redirect, since the form submits back to the
 * `/surprise` URL it's already on and revalidatePath is enough to refresh
 * the RSC payload with a new pick.
 */
export async function skipSurprisePickAction(formData: FormData) {
  const parsed = skipSurprisePickSchema.safeParse({
    provider: formData.get("provider"),
    externalId: formData.get("externalId"),
  });

  if (parsed.success) {
    const cookieStore = await cookies();
    const key = `${parsed.data.provider}:${parsed.data.externalId}`;
    const updated = addSkip(
      cookieStore.get(SURPRISE_SKIP_COOKIE_NAME)?.value,
      key,
    );
    cookieStore.set(SURPRISE_SKIP_COOKIE_NAME, updated, {
      maxAge: SKIP_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  revalidatePath("/surprise");
}
