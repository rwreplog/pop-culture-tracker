import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test", TMDB_API_KEY: "test-tmdb-key" },
}));

const { tmdbAdapter } = await import("@/lib/services/media/tmdb");

describe("tmdbAdapter.search", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes a movie search result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 1,
              title: "Dune",
              release_date: "2021-10-22",
              poster_path: "/x.jpg",
              overview: "A desert planet.",
            },
          ],
        }),
      }),
    );

    const results = await tmdbAdapter.search("dune", "movie");

    expect(results).toEqual([
      {
        provider: "tmdb",
        externalId: "1",
        mediaType: "movie",
        title: "Dune",
        releaseDate: "2021-10-22",
        imageUrl: "https://image.tmdb.org/t/p/w342/x.jpg",
        creator: null,
        description: "A desert planet.",
      },
    ]);
  });

  it("normalizes a tv result using name/first_air_date", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 2,
              name: "Severance",
              first_air_date: "2022-02-18",
              poster_path: null,
              overview: "",
            },
          ],
        }),
      }),
    );

    const results = await tmdbAdapter.search("severance", "tv");

    expect(results).toEqual([
      {
        provider: "tmdb",
        externalId: "2",
        mediaType: "tv",
        title: "Severance",
        releaseDate: "2022-02-18",
        imageUrl: null,
        creator: null,
        description: null,
      },
    ]);
  });

  it("returns an empty array when the response shape is unexpected", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ unexpected: true }),
      }),
    );

    const results = await tmdbAdapter.search("dune", "movie");
    expect(results).toEqual([]);
  });

  it("throws ProviderRequestError on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(tmdbAdapter.search("dune", "movie")).rejects.toThrow();
  });
});

describe("tmdbAdapter.getDetails", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("picks the director as creator for movies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          title: "Dune",
          release_date: "2021-10-22",
          poster_path: "/x.jpg",
          overview: "A desert planet.",
          credits: {
            crew: [
              { job: "Writer", name: "Someone Else" },
              { job: "Director", name: "Denis Villeneuve" },
            ],
          },
        }),
      }),
    );

    const detail = await tmdbAdapter.getDetails("1", "movie");
    expect(detail?.creator).toBe("Denis Villeneuve");
  });

  it("joins created_by names as creator for tv", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 2,
          name: "Severance",
          first_air_date: "2022-02-18",
          created_by: [{ name: "Dan Erickson" }],
        }),
      }),
    );

    const detail = await tmdbAdapter.getDetails("2", "tv");
    expect(detail?.creator).toBe("Dan Erickson");
  });
});
