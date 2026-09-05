import type { MediaType } from "@/lib/db/schema/media";
import type { libraryStatusEnum } from "@/lib/db/schema/library";

type LibraryStatus = (typeof libraryStatusEnum.enumValues)[number];

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  movie: "Movie",
  tv: "TV",
  game: "Game",
  book: "Book",
  comic: "Comic",
};

export function mediaTypeLabel(mediaType: MediaType): string {
  return MEDIA_TYPE_LABELS[mediaType];
}

/**
 * Friendly per-media-type verbs for the "in_progress" status, per
 * docs/PRODUCT.md (e.g. "Watching" for movie/tv, "Playing" for games).
 * Other statuses read fine as-is across every media type.
 */
const IN_PROGRESS_LABELS: Record<MediaType, string> = {
  movie: "Watching",
  tv: "Watching",
  game: "Playing",
  book: "Reading",
  comic: "Reading",
};

const STATUS_LABELS: Record<LibraryStatus, string> = {
  want: "Want to Experience",
  in_progress: "In Progress",
  completed: "Completed",
  paused: "Paused",
  abandoned: "Abandoned",
};

export function libraryStatusLabel(
  status: LibraryStatus,
  mediaType: MediaType,
): string {
  if (status === "in_progress") return IN_PROGRESS_LABELS[mediaType];
  return STATUS_LABELS[status];
}
