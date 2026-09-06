import { z } from "zod";

import { env } from "@/lib/env";
import {
  ProviderNotConfiguredError,
  fetchProviderJson,
} from "@/lib/services/media/http";
import type {
  NormalizedMediaDetail,
  NormalizedSearchResult,
  ProviderAdapter,
} from "@/lib/services/media/provider-types";

const BASE_URL = "https://comicvine.gamespot.com/api";

const volumeSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_year: z.string().nullable().optional(),
  image: z.object({ medium_url: z.string().nullable().optional() }).optional(),
  deck: z.string().nullable().optional(),
  publisher: z.object({ name: z.string() }).nullable().optional(),
});

const searchResponseSchema = z.object({
  results: z.array(volumeSchema).catch([]),
});

const detailResponseSchema = z.object({
  results: volumeSchema.extend({
    description: z.string().nullable().optional(),
  }),
});

function requireApiKey(): string {
  if (!env.COMICVINE_API_KEY) {
    throw new ProviderNotConfiguredError(
      "COMICVINE_API_KEY is not configured.",
    );
  }
  return env.COMICVINE_API_KEY;
}

function stripHtml(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.replace(/<[^>]*>/g, "").trim() || null;
}

function toSearchResult(
  raw: z.infer<typeof volumeSchema>,
): NormalizedSearchResult {
  return {
    provider: "comicvine",
    externalId: String(raw.id),
    mediaType: "comic",
    title: raw.name,
    releaseDate: raw.start_year ? `${raw.start_year}-01-01` : null,
    imageUrl: raw.image?.medium_url ?? null,
    creator: raw.publisher?.name ?? null,
    description: stripHtml(raw.deck),
    // ComicVine doesn't expose genre. See docs/ROADMAP.md Phase 3.
    genres: [],
  };
}

export const comicVineAdapter: ProviderAdapter = {
  provider: "comicvine",

  async search(query) {
    const apiKey = requireApiKey();
    const url = `${BASE_URL}/search/?api_key=${encodeURIComponent(apiKey)}&format=json&resources=volume&query=${encodeURIComponent(query)}`;
    const json = await fetchProviderJson(url, {
      headers: { "User-Agent": "Geekery/1.0" },
    });
    const parsed = searchResponseSchema.safeParse(json);
    if (!parsed.success) return [];
    return parsed.data.results.map(toSearchResult);
  },

  async getDetails(externalId) {
    const apiKey = requireApiKey();
    const url = `${BASE_URL}/volume/4050-${encodeURIComponent(externalId)}/?api_key=${encodeURIComponent(apiKey)}&format=json`;
    const json = await fetchProviderJson(url, {
      headers: { "User-Agent": "Geekery/1.0" },
    });
    const parsed = detailResponseSchema.safeParse(json);
    if (!parsed.success) return null;

    const detail: NormalizedMediaDetail = {
      ...toSearchResult(parsed.data.results),
      description:
        stripHtml(parsed.data.results.description) ||
        stripHtml(parsed.data.results.deck),
      metadata: null,
    };
    return detail;
  },
};
