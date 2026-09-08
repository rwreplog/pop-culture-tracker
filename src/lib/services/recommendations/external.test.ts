import { beforeEach, describe, expect, it, vi } from "vitest";

// vitest sets NODE_ENV=test, so getSurprisePick's provider.discover() calls
// route through the deterministic fixture provider (search.ts's
// providerFor) rather than calling real APIs — see search.test.ts.

const findManyLibraryItemsMock = vi.fn();
const whereMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      libraryItems: { findMany: findManyLibraryItemsMock },
    },
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: whereMock,
        }),
      }),
    }),
  },
}));

const { getSurprisePick } =
  await import("@/lib/services/recommendations/external");

function completedFavorite(genres: string[]) {
  return {
    id: "item-1",
    userId: "user-1",
    mediaId: "media-1",
    status: "completed" as const,
    rating: null,
    isFavorite: true,
    notes: null,
    progress: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    media: {
      id: "media-1",
      mediaType: "movie" as const,
      title: "Something I loved",
      description: null,
      releaseDate: null,
      imageUrl: null,
      metadata: { genres },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  };
}

describe("getSurprisePick", () => {
  beforeEach(() => {
    findManyLibraryItemsMock.mockReset();
    whereMock.mockReset();
  });

  it("returns null immediately for a media type without a discover provider", async () => {
    const pick = await getSurprisePick("user-1", "book", new Set());

    expect(pick).toBeNull();
    expect(findManyLibraryItemsMock).not.toHaveBeenCalled();
  });

  it("picks a genre match and explains why, when the user has a taste signal", async () => {
    findManyLibraryItemsMock.mockResolvedValue([
      completedFavorite(["Science Fiction"]),
    ]);
    whereMock.mockResolvedValue([]);

    const pick = await getSurprisePick("user-1", "movie", new Set());

    expect(pick?.reason).toBe("Because you like Science Fiction");
    expect(pick?.result.provider).toBe("fixture");
    expect(["Dune", "Dune: Part Two"]).toContain(pick?.result.title);
  });

  it("falls back to 'Popular right now' with no taste signal", async () => {
    findManyLibraryItemsMock.mockResolvedValue([]);
    whereMock.mockResolvedValue([]);

    const pick = await getSurprisePick("user-1", "movie", new Set());

    expect(pick?.reason).toBe("Popular right now");
  });

  it("excludes candidates already in the library", async () => {
    findManyLibraryItemsMock.mockResolvedValue([]);
    whereMock.mockResolvedValue([
      { provider: "fixture", externalId: "movie-1" },
    ]);

    const pick = await getSurprisePick("user-1", "movie", new Set());

    expect(pick?.result.externalId).toBe("movie-2");
  });

  it("excludes recently-skipped candidates", async () => {
    findManyLibraryItemsMock.mockResolvedValue([]);
    whereMock.mockResolvedValue([]);

    const pick = await getSurprisePick(
      "user-1",
      "movie",
      new Set(["fixture:movie-1"]),
    );

    expect(pick?.result.externalId).toBe("movie-2");
  });

  it("returns null when every candidate is owned or skipped", async () => {
    findManyLibraryItemsMock.mockResolvedValue([]);
    whereMock.mockResolvedValue([
      { provider: "fixture", externalId: "movie-1" },
    ]);

    const pick = await getSurprisePick(
      "user-1",
      "movie",
      new Set(["fixture:movie-2"]),
    );

    expect(pick).toBeNull();
  });
});
