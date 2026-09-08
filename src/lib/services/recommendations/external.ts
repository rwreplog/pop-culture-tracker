import type { MediaType } from "@/lib/db/schema/media";
import {
  getLibraryItems,
  getLibraryStatusForResults,
} from "@/lib/services/library/queries";
import { providerFor } from "@/lib/services/media/search";
import type { NormalizedSearchResult } from "@/lib/services/media/provider-types";
import { buildGenreAffinity } from "@/lib/services/recommendations/scoring";

/** Media types with a genre-browsable provider catalog — see provider-types.ts's `discover`. */
export const SURPRISE_MEDIA_TYPES: MediaType[] = ["movie", "tv", "game"];

const TOP_GENRES_CONSIDERED = 2;
/** Pick randomly among the top N remaining candidates rather than always the single best match. */
const RANDOM_POOL_SIZE = 10;

export type SurprisePick = {
  result: NormalizedSearchResult;
  reason: string;
};

function resultKey(result: { provider: string; externalId: string }): string {
  return `${result.provider}:${result.externalId}`;
}

/**
 * Picks one movie/TV show/game the user doesn't already have in their
 * library, guessed from the genres of what they've favorited or rated
 * highly (see buildGenreAffinity), falling back to plain popularity when
 * there's no taste signal yet. `excludeKeys` is a "provider:externalId"
 * set of recently-skipped picks (see skip-memory.ts) so "show me something
 * else" doesn't repeat.
 */
export async function getSurprisePick(
  userId: string,
  mediaType: MediaType,
  excludeKeys: Set<string>,
): Promise<SurprisePick | null> {
  if (!SURPRISE_MEDIA_TYPES.includes(mediaType)) return null;

  const provider = providerFor(mediaType);
  if (!provider.discover) return null;

  const items = await getLibraryItems(userId, { mediaType });
  const affinity = buildGenreAffinity(items);
  const topGenres = [...affinity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_GENRES_CONSIDERED)
    .map(([genre]) => genre);

  let candidates: NormalizedSearchResult[];
  try {
    candidates = await provider.discover(mediaType, topGenres);
  } catch {
    return null;
  }
  if (candidates.length === 0) return null;

  const alreadyOwned = await getLibraryStatusForResults(userId, candidates);
  const remaining = candidates.filter(
    (candidate) =>
      !alreadyOwned.has(resultKey(candidate)) &&
      !excludeKeys.has(resultKey(candidate)),
  );
  if (remaining.length === 0) return null;

  const pool = remaining.slice(0, RANDOM_POOL_SIZE);
  const result = pool[Math.floor(Math.random() * pool.length)];
  const reason =
    topGenres.length > 0
      ? `Because you like ${topGenres[0]}`
      : "Popular right now";

  return { result, reason };
}
