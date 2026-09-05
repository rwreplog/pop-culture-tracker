import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { media, mediaExternalIds } from "@/lib/db/schema";
import type { NormalizedSearchResult } from "@/lib/services/media/provider-types";

export type GetOrCreateMediaResult =
  { success: true; mediaId: string } | { success: false; error: string };

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

async function findExisting(provider: string, externalId: string) {
  return db.query.mediaExternalIds.findFirst({
    where: and(
      eq(mediaExternalIds.provider, provider),
      eq(mediaExternalIds.externalId, externalId),
    ),
  });
}

/**
 * Looks up the canonical Media row for a provider/externalId pair, creating
 * one (plus its MediaExternalId link) if this is the first time anyone has
 * added this item. See docs/DATA_MODEL.md: a provider id is only unique
 * within that provider, so dedup always happens on (provider, externalId).
 */
export async function getOrCreateMedia(
  result: NormalizedSearchResult,
): Promise<GetOrCreateMediaResult> {
  const existing = await findExisting(result.provider, result.externalId);
  if (existing) return { success: true, mediaId: existing.mediaId };

  try {
    const mediaId = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(media)
        .values({
          mediaType: result.mediaType,
          title: result.title,
          description: result.description,
          releaseDate: result.releaseDate,
          imageUrl: result.imageUrl,
          metadata: result.creator ? { creator: result.creator } : null,
        })
        .returning({ id: media.id });

      await tx.insert(mediaExternalIds).values({
        mediaId: inserted.id,
        provider: result.provider,
        externalId: result.externalId,
      });

      return inserted.id;
    });

    return { success: true, mediaId };
  } catch (error) {
    if (isUniqueViolation(error)) {
      // Lost a race with a concurrent request creating the same media.
      const racedExisting = await findExisting(
        result.provider,
        result.externalId,
      );
      if (racedExisting) {
        return { success: true, mediaId: racedExisting.mediaId };
      }
    }
    return { success: false, error: "Couldn't add this item right now." };
  }
}
