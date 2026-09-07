import type { LibraryItem } from "@/lib/db/schema/library";
import type { Media, MediaType } from "@/lib/db/schema/media";
import { getMediaGenres } from "@/lib/media/metadata";

type LibraryItemWithMedia = LibraryItem & { media: Media };

export type GoalFilter = {
  year: number;
  mediaType: MediaType | null;
  genre: string | null;
};

/**
 * Counts how many of `items` count toward `goal`: completed within the
 * goal's year, and matching its optional media type/genre filters. Genres
 * are freeform per-provider strings (see moods.ts), so genre matching is
 * a case-insensitive exact match rather than a normalized taxonomy lookup.
 */
export function computeGoalProgress<T extends LibraryItemWithMedia>(
  items: T[],
  goal: GoalFilter,
): number {
  const genre = goal.genre?.toLowerCase();

  return items.filter((item) => {
    if (item.status !== "completed") return false;
    if (item.completedAt?.getFullYear() !== goal.year) return false;
    if (goal.mediaType && item.media.mediaType !== goal.mediaType) {
      return false;
    }
    if (genre) {
      const genres = getMediaGenres(item.media).map((g) => g.toLowerCase());
      if (!genres.includes(genre)) return false;
    }
    return true;
  }).length;
}
