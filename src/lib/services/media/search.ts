import { env } from "@/lib/env";
import type { MediaType } from "@/lib/db/schema/media";
import { comicVineAdapter } from "@/lib/services/media/comicvine";
import { fixtureAdapter } from "@/lib/services/media/fixture";
import { ProviderNotConfiguredError } from "@/lib/services/media/http";
import { igdbAdapter } from "@/lib/services/media/igdb";
import { openLibraryAdapter } from "@/lib/services/media/open-library";
import type {
  GetMediaDetailsResult,
  ProviderAdapter,
  SearchMediaResult,
} from "@/lib/services/media/provider-types";
import { tmdbAdapter } from "@/lib/services/media/tmdb";

const LIVE_PROVIDERS: Record<MediaType, ProviderAdapter> = {
  movie: tmdbAdapter,
  tv: tmdbAdapter,
  game: igdbAdapter,
  book: openLibraryAdapter,
  comic: comicVineAdapter,
};

const FIXTURE_PROVIDERS: Record<MediaType, ProviderAdapter> = {
  movie: fixtureAdapter,
  tv: fixtureAdapter,
  game: fixtureAdapter,
  book: fixtureAdapter,
  comic: fixtureAdapter,
};

function shouldUseFixtures(): boolean {
  return env.NODE_ENV === "test" || env.MEDIA_PROVIDER_MODE === "fixture";
}

function providerFor(mediaType: MediaType): ProviderAdapter {
  return (shouldUseFixtures() ? FIXTURE_PROVIDERS : LIVE_PROVIDERS)[mediaType];
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const searchCache = new Map<
  string,
  { expiresAt: number; result: SearchMediaResult }
>();

/** Searches a single media type's provider, with a short-lived result cache. */
export async function searchMedia(
  query: string,
  mediaType: MediaType,
): Promise<SearchMediaResult> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return { success: true, results: [] };

  const cacheKey = `${providerFor(mediaType).provider}:${mediaType}:${trimmedQuery.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  const provider = providerFor(mediaType);
  let result: SearchMediaResult;
  try {
    const results = await provider.search(trimmedQuery, mediaType);
    result = { success: true, results };
  } catch (error) {
    result = {
      success: false,
      error:
        error instanceof ProviderNotConfiguredError
          ? `Search for this media type isn't configured yet.`
          : `Search is temporarily unavailable. Please try again.`,
    };
  }

  searchCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, result });
  return result;
}

/** Fetches enrichment detail for a specific provider/externalId pair. */
export async function getMediaDetails(
  externalId: string,
  mediaType: MediaType,
): Promise<GetMediaDetailsResult> {
  const provider = providerFor(mediaType);
  try {
    const detail = await provider.getDetails(externalId, mediaType);
    if (!detail) {
      return { success: false, error: "That item couldn't be found." };
    }
    return { success: true, detail };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof ProviderNotConfiguredError
          ? "Search for this media type isn't configured yet."
          : "Couldn't load details right now. Please try again.",
    };
  }
}
