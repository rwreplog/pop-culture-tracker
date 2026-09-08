import { z } from "zod";

import { env } from "@/lib/env";
import { fetchProviderJson } from "@/lib/services/media/http";
import type {
  NormalizedMediaDetail,
  NormalizedSearchResult,
  ProviderAdapter,
} from "@/lib/services/media/provider-types";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

const volumeInfoSchema = z.object({
  title: z.string().optional(),
  authors: z.array(z.string()).optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  categories: z.array(z.string()).optional(),
  imageLinks: z
    .object({
      extraLarge: z.string().optional(),
      large: z.string().optional(),
      medium: z.string().optional(),
      small: z.string().optional(),
      thumbnail: z.string().optional(),
      smallThumbnail: z.string().optional(),
    })
    .optional(),
});

const volumeSchema = z.object({
  id: z.string(),
  volumeInfo: volumeInfoSchema.optional(),
});

const searchResponseSchema = z.object({
  items: z.array(volumeSchema).catch([]).optional(),
});

/**
 * Google's thumbnails are served over http:// and take an optional edge=curl
 * page-curl effect; neither is wanted here. The `zoom` param also controls
 * the rendered resolution of the *same* cover image (higher is larger, up to
 * a cap around 3), so bump it up from the low default search results use.
 */
function normalizeImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url
    .replace(/^http:/, "https:")
    .replace(/&edge=curl/, "")
    .replace(/([?&])zoom=\d+/, "$1zoom=3");
}

/** publishedDate can be "YYYY", "YYYY-MM", or "YYYY-MM-DD" — pad to a full ISO date. */
function normalizeReleaseDate(date: string | undefined): string | null {
  if (!date) return null;
  const parts = date.split("-");
  return `${parts[0]}-${parts[1] ?? "01"}-${parts[2] ?? "01"}`;
}

function toSearchResult(
  raw: z.infer<typeof volumeSchema>,
): NormalizedSearchResult {
  const info = raw.volumeInfo;
  return {
    provider: "google-books",
    externalId: raw.id,
    mediaType: "book",
    title: info?.title ?? "Untitled",
    releaseDate: normalizeReleaseDate(info?.publishedDate),
    imageUrl: normalizeImageUrl(
      info?.imageLinks?.extraLarge ??
        info?.imageLinks?.large ??
        info?.imageLinks?.medium ??
        info?.imageLinks?.small ??
        info?.imageLinks?.thumbnail ??
        info?.imageLinks?.smallThumbnail,
    ),
    creator: info?.authors?.join(", ") ?? null,
    description: info?.description ?? null,
    genres: info?.categories ?? [],
  };
}

function apiKeyParam(): string {
  return env.GOOGLE_BOOKS_API_KEY
    ? `&key=${encodeURIComponent(env.GOOGLE_BOOKS_API_KEY)}`
    : "";
}

export const googleBooksAdapter: ProviderAdapter = {
  provider: "google-books",

  async search(query) {
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=20${apiKeyParam()}`;
    const json = await fetchProviderJson(url);
    const parsed = searchResponseSchema.safeParse(json);
    if (!parsed.success) return [];
    return (parsed.data.items ?? []).map(toSearchResult);
  },

  async getDetails(externalId) {
    const url = `${BASE_URL}/${encodeURIComponent(externalId)}?fields=id,volumeInfo${apiKeyParam()}`;
    const json = await fetchProviderJson(url);
    const parsed = volumeSchema.safeParse(json);
    if (!parsed.success) return null;

    const detail: NormalizedMediaDetail = {
      ...toSearchResult(parsed.data),
      metadata: null,
    };
    return detail;
  },
};
