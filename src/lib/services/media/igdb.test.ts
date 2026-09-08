import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    NODE_ENV: "test",
    IGDB_CLIENT_ID: "test-client-id",
    IGDB_CLIENT_SECRET: "test-client-secret",
  },
}));

// The adapter caches its Twitch access token at module scope, so each test
// resets the module registry and re-imports to start from a clean cache.
async function freshAdapter() {
  vi.resetModules();
  const { igdbAdapter } = await import("@/lib/services/media/igdb");
  return igdbAdapter;
}

function mockFetchSequence(...responses: unknown[]) {
  const fn = vi.fn();
  for (const body of responses) {
    fn.mockResolvedValueOnce({ ok: true, json: async () => body });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

const TOKEN_RESPONSE = { access_token: "test-token", expires_in: 3600 };

describe("igdbAdapter.search", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches a token then normalizes a game search result", async () => {
    const fetchMock = mockFetchSequence(TOKEN_RESPONSE, [
      {
        id: 1942,
        name: "The Witcher 3: Wild Hunt",
        first_release_date: 1431993600,
        cover: { image_id: "abc123" },
        genres: [{ name: "RPG" }],
        summary: "A witcher hunts monsters.",
        involved_companies: [
          { company: { name: "CD Projekt Red" }, developer: true },
          { company: { name: "Some Publisher" }, developer: false },
        ],
      },
    ]);

    const igdbAdapter = await freshAdapter();
    const results = await igdbAdapter.search("witcher", "game");

    expect(results).toEqual([
      {
        provider: "igdb",
        externalId: "1942",
        mediaType: "game",
        title: "The Witcher 3: Wild Hunt",
        releaseDate: "2015-05-19",
        imageUrl:
          "https://images.igdb.com/igdb/image/upload/t_cover_big/abc123.jpg",
        creator: "CD Projekt Red",
        description: "A witcher hunts monsters.",
        genres: ["RPG"],
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [tokenUrl] = fetchMock.mock.calls[0];
    expect(String(tokenUrl)).toContain("id.twitch.tv/oauth2/token");
    const [apiUrl, apiInit] = fetchMock.mock.calls[1];
    expect(String(apiUrl)).toBe("https://api.igdb.com/v4/games");
    expect(apiInit.headers["Client-ID"]).toBe("test-client-id");
    expect(apiInit.headers.Authorization).toBe("Bearer test-token");
  });

  it("reuses a cached token across calls", async () => {
    const fetchMock = mockFetchSequence(TOKEN_RESPONSE, [], []);

    const igdbAdapter = await freshAdapter();
    await igdbAdapter.search("first", "game");
    await igdbAdapter.search("second", "game");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns an empty array when the response shape is unexpected", async () => {
    mockFetchSequence(TOKEN_RESPONSE, { error: "nope" });

    const igdbAdapter = await freshAdapter();
    const results = await igdbAdapter.search("witcher", "game");
    expect(results).toEqual([]);
  });

  it("throws when a non-2xx response is returned", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const igdbAdapter = await freshAdapter();
    await expect(igdbAdapter.search("witcher", "game")).rejects.toThrow();
  });
});

describe("igdbAdapter.getDetails", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when no game matches the id", async () => {
    mockFetchSequence(TOKEN_RESPONSE, []);

    const igdbAdapter = await freshAdapter();
    const detail = await igdbAdapter.getDetails("999", "game");
    expect(detail).toBeNull();
  });

  it("normalizes a matching game", async () => {
    mockFetchSequence(TOKEN_RESPONSE, [
      {
        id: 1942,
        name: "The Witcher 3: Wild Hunt",
        first_release_date: 1431993600,
        cover: null,
        summary: "A witcher hunts monsters.",
        involved_companies: [
          { company: { name: "CD Projekt Red" }, developer: true },
        ],
      },
    ]);

    const igdbAdapter = await freshAdapter();
    const detail = await igdbAdapter.getDetails("1942", "game");
    expect(detail?.title).toBe("The Witcher 3: Wild Hunt");
    expect(detail?.creator).toBe("CD Projekt Red");
    expect(detail?.imageUrl).toBeNull();
    expect(detail?.metadata).toBeNull();
  });

  it("returns null for a non-numeric id without calling the API", async () => {
    const fetchMock = mockFetchSequence();

    const igdbAdapter = await freshAdapter();
    const detail = await igdbAdapter.getDetails("not-a-number", "game");
    expect(detail).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("igdbAdapter.discover", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("filters by genre name in the Apicalypse query", async () => {
    const fetchMock = mockFetchSequence(TOKEN_RESPONSE, [
      {
        id: 1942,
        name: "The Witcher 3: Wild Hunt",
        genres: [{ name: "RPG" }],
      },
    ]);

    const igdbAdapter = await freshAdapter();
    const results = await igdbAdapter.discover?.("game", ["RPG"]);

    expect(results?.[0]?.title).toBe("The Witcher 3: Wild Hunt");
    const [, apiInit] = fetchMock.mock.calls[1];
    expect(String(apiInit.body)).toContain('genres.name = ("RPG")');
  });

  it("omits the genre filter and sorts by rating when there's no genre signal", async () => {
    const fetchMock = mockFetchSequence(TOKEN_RESPONSE, []);

    const igdbAdapter = await freshAdapter();
    await igdbAdapter.discover?.("game", []);

    const [, apiInit] = fetchMock.mock.calls[1];
    expect(String(apiInit.body)).not.toContain("genres.name = (");
    expect(String(apiInit.body)).toContain("where rating_count > 20;");
    expect(String(apiInit.body)).toContain("sort rating desc");
  });
});
