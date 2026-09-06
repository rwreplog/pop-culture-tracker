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
