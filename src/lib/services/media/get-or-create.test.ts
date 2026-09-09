import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirstMock = vi.fn();
const mediaValuesMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      mediaExternalIds: { findFirst: findFirstMock },
    },
    transaction: vi.fn(async (callback: (tx: unknown) => unknown) => {
      let insertCallCount = 0;
      const tx = {
        insert: () => ({
          values: (vals: unknown) => {
            insertCallCount += 1;
            if (insertCallCount === 1) {
              // First insert: the `media` row.
              mediaValuesMock(vals);
              return { returning: async () => [{ id: "new-media-id" }] };
            }
            // Second insert: the `mediaExternalIds` link row.
            return Promise.resolve(undefined);
          },
        }),
      };
      return callback(tx);
    }),
  },
}));

const { getOrCreateMedia } = await import("@/lib/services/media/get-or-create");

const searchResult = {
  provider: "fixture",
  externalId: "movie-1",
  mediaType: "movie" as const,
  title: "Dune",
  releaseDate: "2021-10-22",
  imageUrl: "https://example.com/dune.jpg",
  creator: "Denis Villeneuve",
  description: "A desert planet.",
  genres: ["Science Fiction"],
};

describe("getOrCreateMedia", () => {
  beforeEach(() => {
    findFirstMock.mockReset();
    mediaValuesMock.mockReset();
  });

  it("returns the existing media id when already linked", async () => {
    findFirstMock.mockResolvedValue({ mediaId: "existing-media-id" });

    const result = await getOrCreateMedia(searchResult);

    expect(result).toEqual({ success: true, mediaId: "existing-media-id" });
  });

  it("creates a new media row when no link exists", async () => {
    findFirstMock.mockResolvedValue(undefined);

    const result = await getOrCreateMedia(searchResult);

    expect(result).toEqual({ success: true, mediaId: "new-media-id" });
  });

  it("recovers by re-reading on a unique-constraint race", async () => {
    findFirstMock
      .mockResolvedValueOnce(undefined) // initial check: not found
      .mockResolvedValueOnce({ mediaId: "raced-media-id" }); // re-check after conflict

    const raceError = Object.assign(new Error("duplicate key"), {
      code: "23505",
    });
    const { db } = await import("@/lib/db");
    vi.mocked(db.transaction).mockRejectedValueOnce(raceError);

    const result = await getOrCreateMedia(searchResult);

    expect(result).toEqual({ success: true, mediaId: "raced-media-id" });
  });

  it("folds pageCount/issueCount into metadata alongside creator/genres", async () => {
    findFirstMock.mockResolvedValue(undefined);

    await getOrCreateMedia({
      ...searchResult,
      mediaType: "book",
      pageCount: 320,
    });

    expect(mediaValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ pageCount: 320 }),
      }),
    );
  });

  it("omits pageCount/issueCount from metadata when absent", async () => {
    findFirstMock.mockResolvedValue(undefined);

    await getOrCreateMedia(searchResult);

    const [{ metadata }] = mediaValuesMock.mock.calls[0];
    expect(metadata).not.toHaveProperty("pageCount");
    expect(metadata).not.toHaveProperty("issueCount");
  });

  it("returns a friendly error for unexpected failures", async () => {
    findFirstMock.mockResolvedValue(undefined);
    const { db } = await import("@/lib/db");
    vi.mocked(db.transaction).mockRejectedValueOnce(new Error("boom"));

    const result = await getOrCreateMedia(searchResult);

    expect(result).toEqual({
      success: false,
      error: "Couldn't add this item right now.",
    });
  });
});
