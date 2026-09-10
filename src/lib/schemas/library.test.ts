import { describe, expect, it } from "vitest";

import {
  libraryProgressSchema,
  toggleFavoriteSchema,
  updateNotesSchema,
  updateRatingSchema,
} from "@/lib/schemas/library";

describe("libraryProgressSchema", () => {
  it("accepts tv season/episode and coerces strings to numbers", () => {
    const result = libraryProgressSchema.safeParse({
      mediaType: "tv",
      season: "2",
      episode: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ mediaType: "tv", season: 2, episode: 5 });
    }
  });

  it("rejects tv progress missing episode", () => {
    const result = libraryProgressSchema.safeParse({
      mediaType: "tv",
      season: "2",
    });
    expect(result.success).toBe(false);
  });

  it("accepts book progress with only page or only percent", () => {
    expect(
      libraryProgressSchema.safeParse({ mediaType: "book", page: "120" })
        .success,
    ).toBe(true);
    expect(
      libraryProgressSchema.safeParse({ mediaType: "book", percent: "50" })
        .success,
    ).toBe(true);
  });

  it("rejects a percent out of range", () => {
    const result = libraryProgressSchema.safeParse({
      mediaType: "game",
      percent: "150",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown mediaType (movie has no progress shape)", () => {
    const result = libraryProgressSchema.safeParse({
      mediaType: "movie",
      percent: "50",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateRatingSchema", () => {
  it("treats an empty string as clearing the rating", () => {
    const result = updateRatingSchema.safeParse({
      libraryItemId: "11111111-1111-4111-8111-111111111111",
      rating: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.rating).toBeNull();
  });

  it("rejects a rating above 10", () => {
    const result = updateRatingSchema.safeParse({
      libraryItemId: "11111111-1111-4111-8111-111111111111",
      rating: "11",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateNotesSchema", () => {
  it("treats an empty string as clearing notes", () => {
    const result = updateNotesSchema.safeParse({
      libraryItemId: "11111111-1111-4111-8111-111111111111",
      notes: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.notes).toBeNull();
  });
});

describe("toggleFavoriteSchema", () => {
  it("parses the string 'true'/'false' into a boolean", () => {
    const result = toggleFavoriteSchema.safeParse({
      libraryItemId: "11111111-1111-4111-8111-111111111111",
      isFavorite: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isFavorite).toBe(true);
  });
});
