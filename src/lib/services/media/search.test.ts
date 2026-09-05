import { describe, expect, it } from "vitest";

import { getMediaDetails, searchMedia } from "@/lib/services/media/search";

// Vitest sets NODE_ENV=test, so searchMedia/getMediaDetails route through the
// deterministic fixture provider here rather than calling real APIs.

describe("searchMedia (fixture mode)", () => {
  it("finds matching fixture results case-insensitively", async () => {
    const result = await searchMedia("DUNE", "movie");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results.map((r) => r.title)).toEqual([
        "Dune",
        "Dune: Part Two",
      ]);
    }
  });

  it("returns no results for a query that matches nothing", async () => {
    const result = await searchMedia("nonexistent-xyz", "movie");
    expect(result).toEqual({ success: true, results: [] });
  });

  it("returns no results for a blank query", async () => {
    const result = await searchMedia("   ", "movie");
    expect(result).toEqual({ success: true, results: [] });
  });

  it("only searches the requested media type", async () => {
    // "Saga" is a comic fixture, not a movie.
    const result = await searchMedia("saga", "movie");
    expect(result).toEqual({ success: true, results: [] });
  });
});

describe("getMediaDetails (fixture mode)", () => {
  it("returns detail for a known fixture id", async () => {
    const result = await getMediaDetails("movie-1", "movie");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.detail.title).toBe("Dune");
      expect(result.detail.metadata).toBeNull();
    }
  });

  it("returns an error for an unknown id", async () => {
    const result = await getMediaDetails("does-not-exist", "movie");
    expect(result).toEqual({
      success: false,
      error: "That item couldn't be found.",
    });
  });
});
