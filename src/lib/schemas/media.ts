import { z } from "zod";

export const mediaSearchSchema = z.object({
  query: z.string().trim().min(1, "Enter a search term"),
  mediaType: z.enum(["movie", "tv", "game", "book", "comic"]),
});

export type MediaSearchInput = z.infer<typeof mediaSearchSchema>;

/** FormData can't carry `null`, so empty strings stand in for it on the wire. */
function emptyToNull(value: unknown) {
  return typeof value === "string" && value === "" ? null : value;
}

/**
 * FormData can't carry arrays either, so `genres` crosses the wire as a
 * single JSON-stringified hidden field. Anything malformed just becomes no
 * genres rather than failing the whole form.
 */
function parseGenres(value: unknown): string[] {
  if (typeof value !== "string" || value === "") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((genre): genre is string => typeof genre === "string")
      : [];
  } catch {
    return [];
  }
}

/** FormData values are always strings — empty string stands in for a missing count. */
function emptyToUndefined(value: unknown) {
  return typeof value === "string" && value === "" ? undefined : value;
}

/**
 * A NormalizedSearchResult, as submitted from a search-result form (hidden
 * inputs) back to a server action. Used to resolve/create the canonical
 * Media row for a result the user selected.
 */
export const normalizedSearchResultSchema = z.object({
  provider: z.string().min(1),
  externalId: z.string().min(1),
  mediaType: z.enum(["movie", "tv", "game", "book", "comic"]),
  title: z.string().min(1),
  releaseDate: z.preprocess(emptyToNull, z.string().nullable()),
  imageUrl: z.preprocess(emptyToNull, z.string().nullable()),
  creator: z.preprocess(emptyToNull, z.string().nullable()),
  description: z.preprocess(emptyToNull, z.string().nullable()),
  genres: z.preprocess(parseGenres, z.array(z.string())),
  pageCount: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  issueCount: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
});

export type NormalizedSearchResultInput = z.infer<
  typeof normalizedSearchResultSchema
>;

export const refreshMediaSchema = z.object({
  mediaId: z.string().min(1),
});
