import type { MediaType } from "@/lib/db/schema/media";
import type {
  NormalizedSearchResult,
  ProviderAdapter,
} from "@/lib/services/media/provider-types";

/**
 * Deterministic in-memory data used instead of real provider APIs in tests
 * (and whenever MEDIA_PROVIDER_MODE=fixture). Never calls the network.
 */
const FIXTURES: Record<MediaType, NormalizedSearchResult[]> = {
  movie: [
    {
      provider: "fixture",
      externalId: "movie-1",
      mediaType: "movie",
      title: "Dune",
      releaseDate: "2021-10-22",
      imageUrl: "https://example.com/dune.jpg",
      creator: "Denis Villeneuve",
      description: "A young man's destiny is tied to a desert planet.",
      genres: ["Science Fiction", "Adventure"],
    },
    {
      provider: "fixture",
      externalId: "movie-2",
      mediaType: "movie",
      title: "Dune: Part Two",
      releaseDate: "2024-03-01",
      imageUrl: "https://example.com/dune2.jpg",
      creator: "Denis Villeneuve",
      description: "Paul Atreides unites with the Fremen.",
      genres: ["Science Fiction", "Adventure"],
    },
  ],
  tv: [
    {
      provider: "fixture",
      externalId: "tv-1",
      mediaType: "tv",
      title: "Severance",
      releaseDate: "2022-02-18",
      imageUrl: "https://example.com/severance.jpg",
      creator: "Dan Erickson",
      description:
        "Employees undergo a procedure to separate work and life memories.",
      genres: ["Drama", "Mystery"],
    },
  ],
  game: [
    {
      provider: "fixture",
      externalId: "game-1",
      mediaType: "game",
      title: "Baldur's Gate 3",
      releaseDate: "2023-08-03",
      imageUrl: "https://example.com/bg3.jpg",
      creator: "Larian Studios",
      description: "A party-based RPG set in the Forgotten Realms.",
      genres: ["RPG"],
    },
  ],
  book: [
    {
      provider: "fixture",
      externalId: "book-1",
      mediaType: "book",
      title: "Project Hail Mary",
      releaseDate: "2021-05-04",
      imageUrl: "https://example.com/hailmary.jpg",
      creator: "Andy Weir",
      description: "A lone astronaut must save the earth from disaster.",
      genres: [],
    },
  ],
  comic: [
    {
      provider: "fixture",
      externalId: "comic-1",
      mediaType: "comic",
      title: "Saga",
      releaseDate: "2012-03-14",
      imageUrl: "https://example.com/saga.jpg",
      creator: "Brian K. Vaughan",
      description:
        "Two lovers from warring extraterrestrial races flee with their newborn.",
      genres: [],
    },
  ],
};

export const fixtureAdapter: ProviderAdapter = {
  provider: "fixture",

  async search(query, mediaType) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return FIXTURES[mediaType].filter((result) =>
      result.title.toLowerCase().includes(normalizedQuery),
    );
  },

  async getDetails(externalId, mediaType) {
    const result = FIXTURES[mediaType].find((r) => r.externalId === externalId);
    if (!result) return null;
    return { ...result, metadata: null };
  },

  async discover(mediaType, genres) {
    if (genres.length === 0) return FIXTURES[mediaType];
    return FIXTURES[mediaType].filter((result) =>
      result.genres.some((genre) => genres.includes(genre)),
    );
  },
};
