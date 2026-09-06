import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyLibraryItemsMock = vi.fn();
const findManyActivityMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      libraryItems: { findMany: findManyLibraryItemsMock },
      activity: { findMany: findManyActivityMock },
    },
  },
}));

const { getInsights, getActivityChartData } = await import(
  "@/lib/services/insights/queries"
);

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "item-1",
    userId: "user-1",
    mediaId: "media-1",
    status: "completed" as const,
    rating: null,
    isFavorite: false,
    notes: null,
    progress: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    media: {
      id: "media-1",
      mediaType: "movie" as const,
      title: "Dune",
      description: null,
      releaseDate: "2021-10-22",
      imageUrl: null,
      metadata: null,
      createdAt: new Date("2021-01-01"),
      updatedAt: new Date("2021-01-01"),
    },
    ...overrides,
  };
}

describe("getInsights", () => {
  beforeEach(() => {
    findManyLibraryItemsMock.mockReset();
  });

  it("summarizes an empty library", async () => {
    findManyLibraryItemsMock.mockResolvedValue([]);

    const insights = await getInsights("user-1", 2026);

    expect(insights.overview.totalItems).toBe(0);
    expect(insights.overview.averageRating).toBeNull();
    expect(insights.genreBreakdown).toEqual([]);
    expect(insights.topCreators).toEqual([]);
    expect(insights.annualSummary).toEqual({
      year: 2026,
      completedCount: 0,
      byMediaType: { movie: 0, tv: 0, game: 0, book: 0, comic: 0 },
      topGenres: [],
      topRated: [],
    });
  });

  it("computes status/media-type counts, average rating, and favorites", async () => {
    findManyLibraryItemsMock.mockResolvedValue([
      makeItem({ status: "completed", rating: 8, isFavorite: true }),
      makeItem({
        id: "item-2",
        status: "in_progress",
        rating: 6,
        media: { ...makeItem().media, mediaType: "tv" },
      }),
      makeItem({ id: "item-3", status: "want" }),
    ]);

    const insights = await getInsights("user-1", 2026);

    expect(insights.overview.totalItems).toBe(3);
    expect(insights.overview.byStatus).toMatchObject({
      completed: 1,
      in_progress: 1,
      want: 1,
    });
    expect(insights.overview.byMediaType).toMatchObject({
      movie: 2,
      tv: 1,
    });
    expect(insights.overview.averageRating).toBe(7); // (8 + 6) / 2
    expect(insights.overview.favoritesCount).toBe(1);
  });

  it("counts completedThisYear only for the current calendar year", async () => {
    const now = new Date();
    findManyLibraryItemsMock.mockResolvedValue([
      makeItem({ status: "completed", completedAt: now }),
      makeItem({
        id: "item-2",
        status: "completed",
        completedAt: new Date("2019-01-01"),
      }),
    ]);

    const insights = await getInsights("user-1");

    expect(insights.overview.completedThisYear).toBe(1);
  });

  it("aggregates genre and creator counts across the library", async () => {
    findManyLibraryItemsMock.mockResolvedValue([
      makeItem({
        media: {
          ...makeItem().media,
          metadata: { creator: "Denis Villeneuve", genres: ["Sci-Fi", "Adventure"] },
        },
      }),
      makeItem({
        id: "item-2",
        media: {
          ...makeItem().media,
          id: "media-2",
          metadata: { creator: "Denis Villeneuve", genres: ["Sci-Fi"] },
        },
      }),
      makeItem({
        id: "item-3",
        media: { ...makeItem().media, id: "media-3", metadata: null },
      }),
    ]);

    const insights = await getInsights("user-1", 2026);

    expect(insights.genreBreakdown).toEqual([
      { name: "Sci-Fi", count: 2 },
      { name: "Adventure", count: 1 },
    ]);
    expect(insights.topCreators).toEqual([
      { name: "Denis Villeneuve", count: 2 },
    ]);
  });

  it("builds an annual summary scoped to items completed in the given year", async () => {
    findManyLibraryItemsMock.mockResolvedValue([
      makeItem({
        id: "in-year",
        status: "completed",
        rating: 9,
        completedAt: new Date("2026-03-01"),
        media: {
          ...makeItem().media,
          metadata: { genres: ["Drama"] },
        },
      }),
      makeItem({
        id: "other-year",
        status: "completed",
        rating: 10,
        completedAt: new Date("2025-03-01"),
      }),
      makeItem({
        id: "not-completed",
        status: "in_progress",
        completedAt: null,
      }),
    ]);

    const insights = await getInsights("user-1", 2026);

    expect(insights.annualSummary.completedCount).toBe(1);
    expect(insights.annualSummary.byMediaType.movie).toBe(1);
    expect(insights.annualSummary.topGenres).toEqual([
      { name: "Drama", count: 1 },
    ]);
    expect(insights.annualSummary.topRated).toEqual([
      expect.objectContaining({ libraryItemId: "in-year", rating: 9 }),
    ]);
  });
});

describe("getActivityChartData", () => {
  beforeEach(() => {
    findManyActivityMock.mockReset();
  });

  it("returns a zero-filled bucket per month when there is no activity", async () => {
    findManyActivityMock.mockResolvedValue([]);

    const chart = await getActivityChartData("user-1", 3);

    expect(chart).toHaveLength(3);
    expect(chart.every((bucket) => bucket.count === 0)).toBe(true);
  });

  it("buckets activity rows into their calendar month", async () => {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    findManyActivityMock.mockResolvedValue([
      { createdAt: now },
      { createdAt: now },
    ]);

    const chart = await getActivityChartData("user-1", 1);

    expect(chart).toEqual([{ month: thisMonthKey, count: 2 }]);
  });
});
