import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { getMediaDetails, providerFor } from "@/lib/services/media/search";

export type RefreshMediaResult =
  { success: true } | { success: false; error: string };

/**
 * Re-fetches a media row from its source provider and updates the stored
 * title/description/image plus type-specific metadata (creator, genres,
 * pageCount, issueCount). A field is only overwritten when the provider
 * returns a non-empty value, so a transient bad response never regresses a
 * row to worse/missing data. Powers the one-off backfill script and can back
 * a future "refresh" action in the UI.
 */
export async function refreshMediaDetails(
  mediaId: string,
): Promise<RefreshMediaResult> {
  const existing = await db.query.media.findFirst({
    where: eq(media.id, mediaId),
    with: { externalIds: true },
  });
  if (!existing) return { success: false, error: "Media not found." };

  const provider = providerFor(existing.mediaType);
  const link = existing.externalIds.find(
    (externalId) => externalId.provider === provider.provider,
  );
  if (!link) {
    return {
      success: false,
      error: "No external id on file for this media's provider.",
    };
  }

  const result = await getMediaDetails(link.externalId, existing.mediaType);
  if (!result.success) return result;

  const { detail } = result;
  const priorMetadata = (existing.metadata ?? {}) as Record<string, unknown>;
  const metadata = { ...priorMetadata };
  if (detail.creator) metadata.creator = detail.creator;
  if (detail.genres.length > 0) metadata.genres = detail.genres;
  if (detail.pageCount) metadata.pageCount = detail.pageCount;
  if (detail.issueCount) metadata.issueCount = detail.issueCount;

  await db
    .update(media)
    .set({
      title: detail.title || existing.title,
      description: detail.description ?? existing.description,
      releaseDate: detail.releaseDate ?? existing.releaseDate,
      imageUrl: detail.imageUrl ?? existing.imageUrl,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      updatedAt: new Date(),
    })
    .where(eq(media.id, mediaId));

  return { success: true };
}
