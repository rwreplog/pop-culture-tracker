import { z } from "zod";

import { fetchProviderJson } from "@/lib/services/media/http";
import type {
  NormalizedMediaDetail,
  NormalizedSearchResult,
  ProviderAdapter,
} from "@/lib/services/media/provider-types";

const BASE_URL = "https://openlibrary.org";

const searchDocSchema = z.object({
  key: z.string(),
  title: z.string(),
  first_publish_year: z.number().nullable().optional(),
  author_name: z.array(z.string()).optional(),
  cover_i: z.number().nullable().optional(),
});

const searchResponseSchema = z.object({
  docs: z.array(searchDocSchema).catch([]),
});

const workDetailSchema = z.object({
  title: z.string().optional(),
  covers: z.array(z.number()).optional(),
  description: z
    .union([z.string(), z.object({ value: z.string() })])
    .optional(),
});

function toSearchResult(
  raw: z.infer<typeof searchDocSchema>,
): NormalizedSearchResult {
  return {
    provider: "open-library",
    externalId: raw.key,
    mediaType: "book",
    title: raw.title,
    releaseDate: raw.first_publish_year
      ? `${raw.first_publish_year}-01-01`
      : null,
    imageUrl: raw.cover_i
      ? `https://covers.openlibrary.org/b/id/${raw.cover_i}-M.jpg`
      : null,
    creator: raw.author_name?.join(", ") ?? null,
    description: null,
    // Open Library's "subjects" are noisy free text, not a clean genre
    // list — skip genre for books. See docs/ROADMAP.md Phase 3.
    genres: [],
  };
}

export const openLibraryAdapter: ProviderAdapter = {
  provider: "open-library",

  async search(query) {
    const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`;
    const json = await fetchProviderJson(url);
    const parsed = searchResponseSchema.safeParse(json);
    if (!parsed.success) return [];
    return parsed.data.docs.map(toSearchResult);
  },

  async getDetails(externalId) {
    // externalId is a work key like "/works/OL45804W".
    const url = `${BASE_URL}${externalId}.json`;
    const json = await fetchProviderJson(url);
    const parsed = workDetailSchema.safeParse(json);
    if (!parsed.success) return null;

    const description =
      typeof parsed.data.description === "string"
        ? parsed.data.description
        : (parsed.data.description?.value ?? null);

    const detail: NormalizedMediaDetail = {
      provider: "open-library",
      externalId,
      mediaType: "book",
      title: parsed.data.title ?? "",
      releaseDate: null,
      imageUrl: parsed.data.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${parsed.data.covers[0]}-M.jpg`
        : null,
      // Author names require a separate per-author lookup on Open Library;
      // not worth the extra round trips for MVP detail enrichment.
      creator: null,
      description,
      genres: [],
      metadata: null,
    };
    return detail;
  },
};
