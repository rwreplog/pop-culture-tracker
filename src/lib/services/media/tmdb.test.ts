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
              genre_ids: [878, 12],
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
        genres: ["Science Fiction", "Adventure"],
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
              genre_ids: [18, 9648],
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
        genres: ["Drama", "Mystery"],
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

describe("tmdbAdapter.discover", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps a genre name to its TMDB id in the request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await tmdbAdapter.discover?.("movie", ["Science Fiction"]);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/discover/movie");
    expect(url).toContain("with_genres=878");
  });

  it("maps a tv genre name using the tv genre table", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await tmdbAdapter.discover?.("tv", ["Drama"]);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/discover/tv");
    expect(url).toContain("with_genres=18");
  });

  it("omits with_genres and falls back to popularity when there's no genre signal", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            title: "Dune",
            release_date: "2021-10-22",
            poster_path: "/x.jpg",
            overview: "A desert planet.",
            genre_ids: [878],
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const results = await tmdbAdapter.discover?.("movie", []);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).not.toContain("with_genres");
    expect(url).toContain("sort_by=popularity.desc");
    expect(results?.[0]?.title).toBe("Dune");
  });
});
