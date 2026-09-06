export const MOODS = ["light", "intense", "thoughtful", "cozy"] as const;

export type Mood = (typeof MOODS)[number];

export const MOOD_LABELS: Record<Mood, string> = {
  light: "Something light",
  intense: "Something intense",
  thoughtful: "Something thoughtful",
  cozy: "Something cozy",
};

/**
 * Genre strings that count as a match for each mood. Genre vocabularies
 * differ across providers (movies vs. TV vs. games; see tmdb.ts/rawg.ts), so
 * each list covers the equivalent genre across providers rather than
 * assuming one shared taxonomy.
 */
export const MOOD_GENRES: Record<Mood, string[]> = {
  light: ["Comedy", "Animation", "Family", "Kids", "Music"],
  intense: [
    "Action",
    "Action & Adventure",
    "Thriller",
    "Horror",
    "Crime",
    "War",
    "War & Politics",
  ],
  thoughtful: [
    "Drama",
    "Documentary",
    "History",
    "Mystery",
    "Science Fiction",
    "Sci-Fi & Fantasy",
  ],
  cozy: ["Romance", "Family", "Soap", "Comedy", "Animation"],
};

export function isMood(value: string | undefined): value is Mood {
  return !!value && (MOODS as readonly string[]).includes(value);
}

/**
 * Sentinel `mood` query value for "explicitly no mood" (the "Any mood"
 * link), distinct from the param being absent — which means the caller
 * should fall back to {@link getAutoMood} instead.
 */
export const NO_MOOD = "none";

/**
 * A default mood guess from the current time, used when the user hasn't
 * picked one explicitly. Three broad, deliberately simple buckets: wound
 * down for a late night, up for something bigger on a free weekend, and
 * easy/low-commitment on a weeknight otherwise.
 */
export function getAutoMood(date: Date): Mood {
  const day = date.getDay();
  const hour = date.getHours();

  const isLateNight = hour >= 22 || hour < 5;
  if (isLateNight) return "cozy";

  const isWeekend = day === 0 || day === 6 || (day === 5 && hour >= 17);
  if (isWeekend) return "thoughtful";

  return "light";
}
