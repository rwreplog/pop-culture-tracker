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
 * Friendly per-media-type verbs, per docs/PRODUCT.md ("friendlier labels
 * such as Want to Watch, Watching, Watched, Want to Play, Playing,
 * Completed, etc."). Paused/abandoned read fine as-is across every type.
 */
const WANT_LABELS: Record<MediaType, string> = {
  movie: "Want to Watch",
  tv: "Want to Watch",
  game: "Want to Play",
  book: "Want to Read",
  comic: "Want to Read",
};

const IN_PROGRESS_LABELS: Record<MediaType, string> = {
  movie: "Watching",
  tv: "Watching",
  game: "Playing",
  book: "Reading",
  comic: "Reading",
};

const COMPLETED_LABELS: Record<MediaType, string> = {
  movie: "Watched",
  tv: "Watched",
  game: "Completed",
  book: "Read",
  comic: "Read",
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
  if (status === "want") return WANT_LABELS[mediaType];
  if (status === "in_progress") return IN_PROGRESS_LABELS[mediaType];
  if (status === "completed") return COMPLETED_LABELS[mediaType];
  return STATUS_LABELS[status];
}

/** Lowercase "completed" verb for a media type (watched/read/completed), e.g. "2 of 3 read". */
export function completedVerb(mediaType: MediaType): string {
  return COMPLETED_LABELS[mediaType].toLowerCase();
}
