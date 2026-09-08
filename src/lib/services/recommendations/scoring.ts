import type { LibraryItem } from "@/lib/db/schema/library";
import type { Media } from "@/lib/db/schema/media";
import { getMediaGenres } from "@/lib/media/metadata";
import { MOOD_GENRES, MOOD_LABELS, type Mood } from "./moods";

type LibraryItemWithMedia = LibraryItem & { media: Media };

/** Ratings are a 0-10 half-star scale; 7 is 3.5 stars and up. */
const HIGH_RATING_THRESHOLD = 7;
/** Backlog items older than this get a small neglect boost. */
const NEGLECTED_AFTER_DAYS = 90;

const GENRE_AFFINITY_WEIGHT = 2;
const FAVORITE_BOOST = 3;
const NEGLECT_BOOST = 1;
/**
 * Outweighs genre affinity/favorite/neglect combined so an explicit mood
 * choice reliably wins the ranking rather than just nudging it.
 */
const MOOD_MATCH_BOOST = 10;

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

/** Genres pulled from the user's highly-rated or favorited completed items. */
export function buildGenreAffinity<T extends LibraryItemWithMedia>(
  items: T[],
): Map<string, number> {
  const affinity = new Map<string, number>();
  for (const item of items) {
    if (item.status !== "completed") continue;
    const likedIt =
      item.isFavorite || (item.rating ?? 0) >= HIGH_RATING_THRESHOLD;
    if (!likedIt) continue;

    for (const genre of getMediaGenres(item.media)) {
      affinity.set(genre, (affinity.get(genre) ?? 0) + 1);
    }
  }
  return affinity;
}

function scoreAndExplain(
  item: LibraryItemWithMedia,
  genreAffinity: Map<string, number>,
  mood: Mood | undefined,
): { score: number; reason: string; hasGenreMatch: boolean } {
  let score = 0;
  const reasons: { weight: number; text: string }[] = [];

  if (mood) {
    const moodGenres = MOOD_GENRES[mood];
    const matchesMood = getMediaGenres(item.media).some((genre) =>
      moodGenres.includes(genre),
    );
    if (matchesMood) {
      score += MOOD_MATCH_BOOST;
      reasons.push({
        weight: MOOD_MATCH_BOOST,
        text: `Fits "${MOOD_LABELS[mood]}"`,
      });
    }
  }

  const matchedGenres = getMediaGenres(item.media).filter((genre) =>
    genreAffinity.has(genre),
  );
  if (matchedGenres.length > 0) {
    const affinityScore =
      matchedGenres.reduce(
        (sum, genre) => sum + (genreAffinity.get(genre) ?? 0),
        0,
      ) * GENRE_AFFINITY_WEIGHT;
    score += affinityScore;
    reasons.push({
      weight: affinityScore,
      text: `Matches your taste in ${matchedGenres[0]}`,
    });
  }

  if (item.isFavorite) {
    score += FAVORITE_BOOST;
    reasons.push({ weight: FAVORITE_BOOST, text: "One of your favorites" });
  }

  const ageInDays = daysSince(item.createdAt);
  if (ageInDays > NEGLECTED_AFTER_DAYS) {
    score += NEGLECT_BOOST;
    reasons.push({
      weight: NEGLECT_BOOST,
      text: `In your backlog since ${item.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    });
  }

  reasons.sort((a, b) => b.weight - a.weight);
  const reason = reasons[0]?.text ?? "Next up in your backlog";

  return { score, reason, hasGenreMatch: matchedGenres.length > 0 };
}

export type ScoredBacklogItem<T extends LibraryItemWithMedia> = T & {
  score: number;
  reason: string;
  /** Scored via shared genres with a highly-rated/favorited completed item. */
  hasGenreMatch: boolean;
};

/**
 * Ranks the "want" items in `items` (a user's full library, needed so
 * genre affinity can be derived from their completed items) by genre
 * affinity with highly-rated/favorited completed items, a favorite boost,
 * and a small boost for neglected items — highest score first, ties broken
 * by oldest added first. Pure function so it composes into any caller's
 * already-fetched library (getDashboardSections, getSmartBacklog) without
 * an extra query.
 */
export function rankBacklog<T extends LibraryItemWithMedia>(
  items: T[],
  options: { mood?: Mood } = {},
): ScoredBacklogItem<T>[] {
  const genreAffinity = buildGenreAffinity(items);

  return items
    .filter((item) => item.status === "want")
    .map((item) => ({
      ...item,
      ...scoreAndExplain(item, genreAffinity, options.mood),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
}
