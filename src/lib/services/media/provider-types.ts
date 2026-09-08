import type { MediaType } from "@/lib/db/schema/media";

/**
 * A single search result, normalized to a provider-agnostic shape.
 * See docs/INTEGRATIONS.md: adapters normalize fields, UI never sees
 * provider-specific response shapes.
 */
export type NormalizedSearchResult = {
  provider: string;
  externalId: string;
  mediaType: MediaType;
  title: string;
  /** ISO date string (YYYY-MM-DD), or null if unknown. */
  releaseDate: string | null;
  imageUrl: string | null;
  /** Director/developer/author/studio — whatever the type's primary creator credit is. */
  creator: string | null;
  description: string | null;
  /**
   * Genre names, empty when the provider doesn't expose a clean genre list
   * (Open Library's subjects are noisy free text; ComicVine has none). See
   * docs/ROADMAP.md Phase 3: genre analysis only covers movie/tv/game.
   */
  genres: string[];
};

/** A search result plus any type-specific extra fields for Media.metadata. */
export type NormalizedMediaDetail = NormalizedSearchResult & {
  metadata: Record<string, unknown> | null;
};

export interface ProviderAdapter {
  provider: string;
  search(
    query: string,
    mediaType: MediaType,
  ): Promise<NormalizedSearchResult[]>;
  getDetails(
    externalId: string,
    mediaType: MediaType,
  ): Promise<NormalizedMediaDetail | null>;
  /**
   * Popular/well-regarded items for a media type, optionally narrowed to
   * genres the caller knows the user likes. Only implemented by providers
   * with a genre-browsable catalog (tmdb, igdb) — used for "surprise me"
   * style discovery rather than a typed search query.
   */
  discover?(
    mediaType: MediaType,
    genres: string[],
  ): Promise<NormalizedSearchResult[]>;
}

export type SearchMediaResult =
  | { success: true; results: NormalizedSearchResult[] }
  | { success: false; error: string };

export type GetMediaDetailsResult =
  | { success: true; detail: NormalizedMediaDetail }
  | { success: false; error: string };
