import { z } from "zod";

import { env } from "@/lib/env";
import type { MediaType } from "@/lib/db/schema/media";
import {
  ProviderNotConfiguredError,
  fetchProviderJson,
} from "@/lib/services/media/http";
import type {
  NormalizedMediaDetail,
  NormalizedSearchResult,
  ProviderAdapter,
} from "@/lib/services/media/provider-types";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";

const searchResultSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  overview: z.string().optional(),
  genre_ids: z.array(z.number()).optional(),
});

/**
 * TMDB's search endpoint only returns genre ids, not names, and its genre
 * lists are stable/well-known — so map them locally rather than making an
 * extra request. https://developer.themoviedb.org/reference/genre-movie-list
 * and .../genre-tv-list.
 */
const MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const TV_GENRES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

function genreNames(
  genreIds: number[] | undefined,
  mediaType: MediaType,
): string[] {
  const table = mediaType === "tv" ? TV_GENRES : MOVIE_GENRES;
  return (genreIds ?? []).map((id) => table[id]).filter((name) => !!name);
}

const searchResponseSchema = z.object({
  results: z.array(searchResultSchema).catch([]),
});

function requireApiKey(): string {
  if (!env.TMDB_API_KEY) {
    throw new ProviderNotConfiguredError("TMDB_API_KEY is not configured.");
  }
  return env.TMDB_API_KEY;
}

function toSearchResult(
  raw: z.infer<typeof searchResultSchema>,
  mediaType: MediaType,
): NormalizedSearchResult {
  return {
    provider: "tmdb",
    externalId: String(raw.id),
    mediaType,
    title: raw.title ?? raw.name ?? "Untitled",
    releaseDate: raw.release_date || raw.first_air_date || null,
    imageUrl: raw.poster_path ? `${IMAGE_BASE_URL}${raw.poster_path}` : null,
    creator: null,
    description: raw.overview || null,
    genres: genreNames(raw.genre_ids, mediaType),
  };
}

export const tmdbAdapter: ProviderAdapter = {
  provider: "tmdb",

  async search(query, mediaType) {
    const apiKey = requireApiKey();
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const url = `${BASE_URL}/search/${endpoint}?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}`;
    const json = await fetchProviderJson(url);
    const parsed = searchResponseSchema.safeParse(json);
    if (!parsed.success) return [];
    return parsed.data.results.map((r) => toSearchResult(r, mediaType));
  },

  async getDetails(externalId, mediaType) {
    const apiKey = requireApiKey();
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const append = mediaType === "tv" ? "" : "&append_to_response=credits";
    const url = `${BASE_URL}/${endpoint}/${encodeURIComponent(externalId)}?api_key=${encodeURIComponent(apiKey)}${append}`;
    const json = await fetchProviderJson(url);

    const detailSchema = searchResultSchema.extend({
      created_by: z.array(z.object({ name: z.string() })).optional(),
      credits: z
        .object({
          crew: z
            .array(z.object({ job: z.string(), name: z.string() }))
            .optional(),
        })
        .optional(),
      // The detail endpoint returns full genre objects, not genre_ids.
      genres: z.array(z.object({ name: z.string() })).optional(),
    });
    const parsed = detailSchema.safeParse(json);
    if (!parsed.success) return null;

    const base = toSearchResult(parsed.data, mediaType);
    const creator =
      mediaType === "tv"
        ? (parsed.data.created_by?.map((c) => c.name).join(", ") ?? null)
        : (parsed.data.credits?.crew?.find((c) => c.job === "Director")?.name ??
          null);

    const detail: NormalizedMediaDetail = {
      ...base,
      creator: creator || null,
      genres: parsed.data.genres?.map((g) => g.name) ?? base.genres,
      metadata: null,
    };
    return detail;
  },
};
