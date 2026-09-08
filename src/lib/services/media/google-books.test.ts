import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test", GOOGLE_BOOKS_API_KEY: undefined },
}));

const { googleBooksAdapter } = await import(
  "@/lib/services/media/google-books"
);

describe("googleBooksAdapter.search", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes a search result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "abc123",
              volumeInfo: {
                title: "Project Hail Mary",
                authors: ["Andy Weir"],
                publishedDate: "2021-05-04",
                description: "A lone astronaut must save the earth.",
                categories: ["Fiction"],
                imageLinks: {
                  thumbnail: "http://books.google.com/x.jpg&edge=curl",
                },
              },
            },
          ],
        }),
      }),
    );

    const results = await googleBooksAdapter.search("hail mary", "book");

    expect(results).toEqual([
      {
        provider: "google-books",
        externalId: "abc123",
        mediaType: "book",
        title: "Project Hail Mary",
        releaseDate: "2021-05-04",
        imageUrl: "https://books.google.com/x.jpg",
        creator: "Andy Weir",
        description: "A lone astronaut must save the earth.",
        genres: ["Fiction"],
      },
    ]);
  });

  it("pads a year-only publishedDate to a full ISO date", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "abc123",
              volumeInfo: { title: "Old Book", publishedDate: "1955" },
            },
          ],
        }),
      }),
    );

    const results = await googleBooksAdapter.search("old book", "book");
    expect(results[0].releaseDate).toBe("1955-01-01");
  });

  it("returns an empty array when there are no items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );

    const results = await googleBooksAdapter.search("nothing", "book");
    expect(results).toEqual([]);
  });

  it("throws ProviderRequestError on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(
      googleBooksAdapter.search("hail mary", "book"),
    ).rejects.toThrow();
  });
});

describe("googleBooksAdapter.getDetails", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes volume details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "abc123",
          volumeInfo: {
            title: "Project Hail Mary",
            authors: ["Andy Weir"],
            publishedDate: "2021-05-04",
          },
        }),
      }),
    );

    const detail = await googleBooksAdapter.getDetails("abc123", "book");
    expect(detail?.creator).toBe("Andy Weir");
    expect(detail?.metadata).toBeNull();
  });

  it("returns null when the response shape is unexpected", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );

    const detail = await googleBooksAdapter.getDetails("abc123", "book");
    expect(detail).toBeNull();
  });
});
