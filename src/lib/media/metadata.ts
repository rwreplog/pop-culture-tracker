import type { Media } from "@/lib/db/schema/media";

/**
 * `media.metadata` is an untyped jsonb blob (see schema comment) that in
 * practice only ever holds `creator`/`genres`/`pageCount`/`issueCount`,
 * written by `getOrCreateMedia`. Centralizes the cast so every reader
 * agrees on shape.
 */
type MediaMetadata = {
  creator?: string;
  genres?: string[];
  /** Total pages, from Google Books — absent for books added before this existed, or without one. */
  pageCount?: number;
  /** Total issues in the series, from ComicVine — same absence caveat. */
  issueCount?: number;
};

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

export function getMediaPageCount(
  media: Pick<Media, "metadata">,
): number | undefined {
  return mediaMetadata(media).pageCount;
}

export function getMediaIssueCount(
  media: Pick<Media, "metadata">,
): number | undefined {
  return mediaMetadata(media).issueCount;
}
