import { describe, expect, it } from "vitest";

import type { LibraryItem } from "@/lib/db/schema/library";
import type { Media } from "@/lib/db/schema/media";
import { computeGoalProgress } from "@/lib/services/goals/progress";

type LibraryItemWithMedia = LibraryItem & { media: Media };

let nextId = 0;

function item(
  overrides: Partial<LibraryItem> & {
    media?: Partial<Media> & { genres?: string[] };
  } = {},
): LibraryItemWithMedia {
  nextId += 1;
  const { media: mediaOverrides = {}, ...itemOverrides } = overrides;
  const { genres, ...mediaFields } = mediaOverrides;

  return {
    id: `item-${nextId}`,
    userId: "user-1",
    mediaId: `media-${nextId}`,
    status: "completed",
    rating: null,
    isFavorite: false,
    notes: null,
    progress: null,
    startedAt: null,
    completedAt: new Date(2024, 5, 1),
    createdAt: new Date(2024, 0, nextId),
    updatedAt: new Date(2024, 0, nextId),
    ...itemOverrides,
    media: {
      id: `media-${nextId}`,
      mediaType: "movie",
      title: `Item ${nextId}`,
      description: null,
      releaseDate: null,
      imageUrl: null,
      metadata: genres ? { genres } : null,
      createdAt: new Date(2024, 0, nextId),
      updatedAt: new Date(2024, 0, nextId),
      ...mediaFields,
    } as Media,
  } as LibraryItemWithMedia;
}

describe("computeGoalProgress", () => {
  it("counts only completed items", () => {
    const items = [
      item({ status: "completed" }),
      item({ status: "in_progress", completedAt: null }),
      item({ status: "want", completedAt: null }),
    ];

    expect(
      computeGoalProgress(items, { year: 2024, mediaType: null, genre: null }),
    ).toBe(1);
  });

  it("only counts items completed in the goal's year", () => {
    const items = [
      item({ completedAt: new Date(2024, 0, 1) }),
      item({ completedAt: new Date(2023, 11, 31) }),
    ];

    expect(
      computeGoalProgress(items, { year: 2024, mediaType: null, genre: null }),
    ).toBe(1);
  });

  it("filters by media type when set", () => {
    const items = [
      item({ media: { mediaType: "book" } }),
      item({ media: { mediaType: "movie" } }),
    ];

    expect(
      computeGoalProgress(items, {
        year: 2024,
        mediaType: "book",
        genre: null,
      }),
    ).toBe(1);
  });

  it("filters by genre case-insensitively when set", () => {
    const items = [
      item({ media: { genres: ["Science Fiction"] } }),
      item({ media: { genres: ["Romance"] } }),
    ];

    expect(
      computeGoalProgress(items, {
        year: 2024,
        mediaType: null,
        genre: "science fiction",
      }),
    ).toBe(1);
  });

  it("combines media type and genre filters", () => {
    const items = [
      item({ media: { mediaType: "book", genres: ["Science Fiction"] } }),
      item({ media: { mediaType: "movie", genres: ["Science Fiction"] } }),
      item({ media: { mediaType: "book", genres: ["Romance"] } }),
    ];

    expect(
      computeGoalProgress(items, {
        year: 2024,
        mediaType: "book",
        genre: "Science Fiction",
      }),
    ).toBe(1);
  });
});
