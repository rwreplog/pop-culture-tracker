import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test", COMICVINE_API_KEY: "test-key" },
}));

const { comicVineAdapter } = await import("@/lib/services/media/comicvine");

describe("comicVineAdapter.search", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes a search result, including count_of_issues", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 123,
              name: "Batman (2011)",
              start_year: "2011",
              image: { medium_url: "https://comicvine.example.com/x.jpg" },
              deck: "The Dark Knight begins again.",
              publisher: { name: "DC Comics" },
              count_of_issues: 52,
            },
          ],
        }),
      }),
    );

    const results = await comicVineAdapter.search("batman", "comic");

    expect(results).toEqual([
      {
        provider: "comicvine",
        externalId: "123",
        mediaType: "comic",
        title: "Batman (2011)",
        releaseDate: "2011-01-01",
        imageUrl: "https://comicvine.example.com/x.jpg",
        creator: "DC Comics",
        description: "The Dark Knight begins again.",
        genres: [],
        issueCount: 52,
      },
    ]);
  });

  it("defaults issueCount to null when the field is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ id: 123, name: "Batman (2011)" }],
        }),
      }),
    );

    const results = await comicVineAdapter.search("batman", "comic");
    expect(results[0].issueCount).toBeNull();
  });
});
