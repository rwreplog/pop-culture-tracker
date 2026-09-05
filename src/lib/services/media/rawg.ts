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

const BASE_URL = "https://api.rawg.io/api";

const searchResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  released: z.string().nullable().optional(),
  background_image: z.string().nullable().optional(),
});

const searchResponseSchema = z.object({
  results: z.array(searchResultSchema).catch([]),
});

const detailSchema = searchResultSchema.extend({
  description_raw: z.string().optional(),
  developers: z.array(z.object({ name: z.string() })).optional(),
});

function requireApiKey(): string {
  if (!env.RAWG_API_KEY) {
    throw new ProviderNotConfiguredError("RAWG_API_KEY is not configured.");
  }
  return env.RAWG_API_KEY;
}

function toSearchResult(
  raw: z.infer<typeof searchResultSchema>,
): NormalizedSearchResult {
  return {
    provider: "rawg",
    externalId: String(raw.id),
    mediaType: "game",
    title: raw.name,
    releaseDate: raw.released ?? null,
    imageUrl: raw.background_image ?? null,
    creator: null,
    description: null,
  };
}

export const rawgAdapter: ProviderAdapter = {
  provider: "rawg",

  async search(query) {
    const apiKey = requireApiKey();
    const url = `${BASE_URL}/games?key=${encodeURIComponent(apiKey)}&search=${encodeURIComponent(query)}`;
    const json = await fetchProviderJson(url);
    const parsed = searchResponseSchema.safeParse(json);
    if (!parsed.success) return [];
    return parsed.data.results.map(toSearchResult);
  },

  async getDetails(externalId) {
    const apiKey = requireApiKey();
    const url = `${BASE_URL}/games/${encodeURIComponent(externalId)}?key=${encodeURIComponent(apiKey)}`;
    const json = await fetchProviderJson(url);
    const parsed = detailSchema.safeParse(json);
    if (!parsed.success) return null;

    const detail: NormalizedMediaDetail = {
      ...toSearchResult(parsed.data),
      description: parsed.data.description_raw || null,
      creator: parsed.data.developers?.map((d) => d.name).join(", ") || null,
      metadata: null,
    };
    return detail;
  },
};
