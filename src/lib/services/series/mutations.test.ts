import { beforeEach, describe, expect, it, vi } from "vitest";

const mediaFindFirstMock = vi.fn();
const mediaFindManyMock = vi.fn();
const selectWhereMock = vi.fn();
const updateSetMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    transaction: vi.fn(async (callback: (tx: unknown) => unknown) => {
      const tx = {
        query: {
          media: { findFirst: mediaFindFirstMock, findMany: mediaFindManyMock },
        },
        select: () => ({
          from: () => ({
            where: async () => selectWhereMock(),
          }),
        }),
        update: () => ({
          set: (vals: unknown) => ({
            where: async () => {
              updateSetMock(vals);
            },
          }),
        }),
      };
      return callback(tx);
    }),
  },
}));

const { addToSeries, reorderSeriesMember } =
  await import("@/lib/services/series/mutations");

beforeEach(() => {
  mediaFindFirstMock.mockReset();
  mediaFindManyMock.mockReset();
  selectWhereMock.mockReset();
  updateSetMock.mockReset();
});

describe("addToSeries", () => {
  it("rejects adding a series to itself", async () => {
    const result = await addToSeries("media-1", "media-1");

    expect(result).toEqual({
      success: false,
      error: "A series can't contain itself.",
    });
  });

  it("rejects when the series can't be found", async () => {
    mediaFindFirstMock.mockResolvedValueOnce(undefined); // series lookup
    mediaFindFirstMock.mockResolvedValueOnce({
      id: "media-1",
      mediaType: "book",
    });

    const result = await addToSeries("media-1", "series-1");

    expect(result).toEqual({
      success: false,
      error: "That series couldn't be found.",
    });
  });

  it("rejects mixing media types", async () => {
    mediaFindFirstMock.mockResolvedValueOnce({
      id: "series-1",
      mediaType: "book",
    });
    mediaFindFirstMock.mockResolvedValueOnce({
      id: "media-1",
      mediaType: "movie",
    });

    const result = await addToSeries("media-1", "series-1");

    expect(result).toEqual({
      success: false,
      error: "A series can only contain items of the same type.",
    });
  });

  it("appends at max(position)+1", async () => {
    mediaFindFirstMock.mockResolvedValueOnce({
      id: "series-1",
      mediaType: "book",
    });
    mediaFindFirstMock.mockResolvedValueOnce({
      id: "media-3",
      mediaType: "book",
    });
    selectWhereMock.mockResolvedValue([{ maxPosition: 2 }]);

    const result = await addToSeries("media-3", "series-1");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({ seriesId: "series-1", seriesPosition: 3 }),
    );
  });

  it("starts at position 1 for the first member", async () => {
    mediaFindFirstMock.mockResolvedValueOnce({
      id: "series-1",
      mediaType: "book",
    });
    mediaFindFirstMock.mockResolvedValueOnce({
      id: "media-1",
      mediaType: "book",
    });
    selectWhereMock.mockResolvedValue([{ maxPosition: null }]);

    const result = await addToSeries("media-1", "series-1");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({ seriesPosition: 1 }),
    );
  });
});

const MEMBERS = [
  { id: "media-a", seriesPosition: 1 },
  { id: "media-b", seriesPosition: 2 },
  { id: "media-c", seriesPosition: 3 },
];

describe("reorderSeriesMember", () => {
  it("rejects when the item isn't a member of the series", async () => {
    mediaFindManyMock.mockResolvedValue(MEMBERS);

    const result = await reorderSeriesMember("series-1", "media-x", "up");

    expect(result).toEqual({
      success: false,
      error: "That item couldn't be found in the series.",
    });
  });

  it("swaps positions with the previous member when moving up", async () => {
    mediaFindManyMock.mockResolvedValue(MEMBERS);

    const result = await reorderSeriesMember("series-1", "media-b", "up");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).toHaveBeenNthCalledWith(1, { seriesPosition: 1 });
    expect(updateSetMock).toHaveBeenNthCalledWith(2, { seriesPosition: 2 });
  });

  it("swaps positions with the next member when moving down", async () => {
    mediaFindManyMock.mockResolvedValue(MEMBERS);

    const result = await reorderSeriesMember("series-1", "media-b", "down");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).toHaveBeenNthCalledWith(1, { seriesPosition: 3 });
    expect(updateSetMock).toHaveBeenNthCalledWith(2, { seriesPosition: 2 });
  });

  it("is a no-op at the top edge", async () => {
    mediaFindManyMock.mockResolvedValue(MEMBERS);

    const result = await reorderSeriesMember("series-1", "media-a", "up");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).not.toHaveBeenCalled();
  });

  it("is a no-op at the bottom edge", async () => {
    mediaFindManyMock.mockResolvedValue(MEMBERS);

    const result = await reorderSeriesMember("series-1", "media-c", "down");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).not.toHaveBeenCalled();
  });
});
