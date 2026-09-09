import { describe, expect, it } from "vitest";

import { normalizedSearchResultSchema } from "@/lib/schemas/media";

describe("normalizedSearchResultSchema", () => {
  it("treats empty strings as null for nullable fields", () => {
    const result = normalizedSearchResultSchema.safeParse({
      provider: "fixture",
      externalId: "movie-1",
      mediaType: "movie",
      title: "Dune",
      releaseDate: "",
      imageUrl: "",
      creator: "",
      description: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.releaseDate).toBeNull();
      expect(result.data.imageUrl).toBeNull();
      expect(result.data.creator).toBeNull();
      expect(result.data.description).toBeNull();
    }
  });

  it("passes through non-empty values unchanged", () => {
    const result = normalizedSearchResultSchema.safeParse({
      provider: "fixture",
      externalId: "movie-1",
      mediaType: "movie",
      title: "Dune",
      releaseDate: "2021-10-22",
      imageUrl: "https://example.com/dune.jpg",
      creator: "Denis Villeneuve",
      description: "A desert planet.",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.releaseDate).toBe("2021-10-22");
      expect(result.data.creator).toBe("Denis Villeneuve");
    }
  });

  it("rejects a missing title", () => {
    const result = normalizedSearchResultSchema.safeParse({
      provider: "fixture",
      externalId: "movie-1",
      mediaType: "movie",
      title: "",
      releaseDate: "",
      imageUrl: "",
      creator: "",
      description: "",
    });

    expect(result.success).toBe(false);
  });

  it("coerces pageCount/issueCount hidden-input strings to numbers", () => {
    const result = normalizedSearchResultSchema.safeParse({
      provider: "google-books",
      externalId: "book-1",
      mediaType: "book",
      title: "Project Hail Mary",
      releaseDate: "",
      imageUrl: "",
      creator: "",
      description: "",
      pageCount: "476",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pageCount).toBe(476);
      expect(result.data.issueCount).toBeUndefined();
    }
  });

  it("treats an empty pageCount/issueCount string as absent", () => {
    const result = normalizedSearchResultSchema.safeParse({
      provider: "fixture",
      externalId: "movie-1",
      mediaType: "movie",
      title: "Dune",
      releaseDate: "",
      imageUrl: "",
      creator: "",
      description: "",
      pageCount: "",
      issueCount: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pageCount).toBeUndefined();
      expect(result.data.issueCount).toBeUndefined();
    }
  });

  it("rejects an unknown mediaType", () => {
    const result = normalizedSearchResultSchema.safeParse({
      provider: "fixture",
      externalId: "1",
      mediaType: "anime",
      title: "Something",
      releaseDate: "",
      imageUrl: "",
      creator: "",
      description: "",
    });

    expect(result.success).toBe(false);
  });
});
