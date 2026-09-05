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
});

export type NormalizedSearchResultInput = z.infer<
  typeof normalizedSearchResultSchema
>;
