import type { Media } from "@/lib/db/schema/media";

/**
 * `media.metadata` is an untyped jsonb blob (see schema comment) that in
 * practice only ever holds `creator`/`genres`, written by
 * `getOrCreateMedia`. Centralizes the cast so every reader agrees on shape.
 */
type MediaMetadata = { creator?: string; genres?: string[] };

function mediaMetadata(media: Pick<Media, "metadata">): MediaMetadata {
  return (media.metadata ?? {}) as MediaMetadata;
}

export function getMediaGenres(media: Pick<Media, "metadata">): string[] {
  return mediaMetadata(media).genres ?? [];
}

export function getMediaCreator(
  media: Pick<Media, "metadata">,
): string | undefined {
  return mediaMetadata(media).creator;
}
