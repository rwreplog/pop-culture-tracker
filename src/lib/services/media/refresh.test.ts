import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirstMock = vi.fn();
const updateSetMock = vi.fn();
const getMediaDetailsMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      media: { findFirst: findFirstMock },
    },
    update: () => ({
      set: (vals: unknown) => {
        updateSetMock(vals);
        return { where: vi.fn() };
      },
    }),
  },
}));

vi.mock("@/lib/services/media/search", () => ({
  getMediaDetails: getMediaDetailsMock,
  providerFor: () => ({ provider: "google-books" }),
}));

const { refreshMediaDetails } = await import("@/lib/services/media/refresh");

const existingRow = {
  id: "media-1",
  mediaType: "book" as const,
  title: "Old Title",
  description: "Old description",
  releaseDate: "2020-01-01",
  imageUrl: "https://example.com/old.jpg",
  metadata: { creator: "Old Author" },
  externalIds: [{ provider: "google-books", externalId: "abc123" }],
};

const freshDetail = {
  provider: "google-books",
  externalId: "abc123",
  mediaType: "book" as const,
  title: "New Title",
  releaseDate: "2021-05-01",
  imageUrl: "https://example.com/new.jpg",
  creator: "New Author",
  description: "New description",
  genres: [],
  pageCount: 320,
  metadata: null,
};

describe("refreshMediaDetails", () => {
  beforeEach(() => {
    findFirstMock.mockReset();
    updateSetMock.mockReset();
    getMediaDetailsMock.mockReset();
  });

  it("returns an error when the media row doesn't exist", async () => {
    findFirstMock.mockResolvedValue(undefined);

    const result = await refreshMediaDetails("missing-id");

    expect(result).toEqual({ success: false, error: "Media not found." });
  });

  it("returns an error when there's no external id for the media's provider", async () => {
    findFirstMock.mockResolvedValue({ ...existingRow, externalIds: [] });

    const result = await refreshMediaDetails("media-1");

    expect(result).toEqual({
      success: false,
      error: "No external id on file for this media's provider.",
    });
  });

  it("propagates a failed provider fetch", async () => {
    findFirstMock.mockResolvedValue(existingRow);
    getMediaDetailsMock.mockResolvedValue({
      success: false,
      error: "Couldn't load details right now. Please try again.",
    });

    const result = await refreshMediaDetails("media-1");

    expect(result).toEqual({
      success: false,
      error: "Couldn't load details right now. Please try again.",
    });
  });

  it("overwrites title/image/metadata with fresh provider data", async () => {
    findFirstMock.mockResolvedValue(existingRow);
    getMediaDetailsMock.mockResolvedValue({
      success: true,
      detail: freshDetail,
    });

    const result = await refreshMediaDetails("media-1");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Title",
        description: "New description",
        releaseDate: "2021-05-01",
        imageUrl: "https://example.com/new.jpg",
        metadata: expect.objectContaining({
          creator: "New Author",
          pageCount: 320,
        }),
      }),
    );
  });

  it("keeps prior fields when the fresh fetch omits them", async () => {
    findFirstMock.mockResolvedValue(existingRow);
    getMediaDetailsMock.mockResolvedValue({
      success: true,
      detail: {
        ...freshDetail,
        imageUrl: null,
        description: null,
        creator: null,
        pageCount: null,
      },
    });

    await refreshMediaDetails("media-1");

    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Old description",
        imageUrl: "https://example.com/old.jpg",
        metadata: expect.objectContaining({ creator: "Old Author" }),
      }),
    );
  });
});
