import { beforeEach, describe, expect, it, vi } from "vitest";

import { activity } from "@/lib/db/schema/activity";

const findFirstMock = vi.fn();
const activityValuesMock = vi.fn();
const libraryInsertReturningMock = vi.fn();
const updateSetMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    transaction: vi.fn(async (callback: (tx: unknown) => unknown) => {
      const tx = {
        query: { libraryItems: { findFirst: findFirstMock } },
        insert: (table: unknown) => ({
          values: (vals: unknown) => {
            if (table === activity) {
              activityValuesMock(vals);
              return Promise.resolve(undefined);
            }
            // The `libraryItems` insert path (addToLibrary).
            return {
              onConflictDoNothing: () => ({
                returning: async () => libraryInsertReturningMock(vals),
              }),
            };
          },
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
    delete: vi.fn(),
  },
}));

const { addToLibrary, updateLibraryItem, removeFromLibrary } = await import(
  "@/lib/services/library/mutations"
);

beforeEach(() => {
  findFirstMock.mockReset();
  activityValuesMock.mockReset();
  libraryInsertReturningMock.mockReset();
  updateSetMock.mockReset();
});

describe("addToLibrary", () => {
  it("creates a new library item and logs an 'added' activity", async () => {
    libraryInsertReturningMock.mockReturnValue([{ id: "new-item-id" }]);

    const result = await addToLibrary("user-1", "media-1", "want");

    expect(result).toEqual({
      success: true,
      libraryItemId: "new-item-id",
      mediaId: "media-1",
    });
    expect(activityValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "added", mediaId: "media-1" }),
    );
  });

  it("also logs 'started' when added directly as in_progress", async () => {
    libraryInsertReturningMock.mockReturnValue([{ id: "new-item-id" }]);

    await addToLibrary("user-1", "media-1", "in_progress");

    const types = activityValuesMock.mock.calls.map((call) => call[0].type);
    expect(types).toEqual(["added", "started"]);
  });

  it("is idempotent: returns the existing item without logging again", async () => {
    libraryInsertReturningMock.mockReturnValue([]); // onConflictDoNothing skipped the insert
    findFirstMock.mockResolvedValue({ id: "existing-item-id" });

    const result = await addToLibrary("user-1", "media-1", "want");

    expect(result).toEqual({
      success: true,
      libraryItemId: "existing-item-id",
      mediaId: "media-1",
    });
    expect(activityValuesMock).not.toHaveBeenCalled();
  });
});

describe("updateLibraryItem", () => {
  const existingItem = {
    id: "item-1",
    userId: "user-1",
    mediaId: "media-1",
    status: "want" as const,
    rating: null,
    isFavorite: false,
    notes: null,
    startedAt: null,
    completedAt: null,
  };

  it("rejects when the item doesn't belong to the requesting user", async () => {
    findFirstMock.mockResolvedValue(undefined);

    const result = await updateLibraryItem("someone-else", "item-1", {
      status: "completed",
    });

    expect(result).toEqual({
      success: false,
      error: "That item couldn't be found.",
    });
    expect(updateSetMock).not.toHaveBeenCalled();
  });

  it("logs 'completed' on a transition into completed", async () => {
    findFirstMock.mockResolvedValue(existingItem);

    const result = await updateLibraryItem("user-1", "item-1", {
      status: "completed",
    });

    expect(result).toEqual({
      success: true,
      libraryItemId: "item-1",
      mediaId: "media-1",
    });
    expect(activityValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "completed", mediaId: "media-1" }),
    );
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed" }),
    );
  });

  it("does not log a status activity when the status is unchanged", async () => {
    findFirstMock.mockResolvedValue(existingItem);

    await updateLibraryItem("user-1", "item-1", { status: "want" });

    expect(activityValuesMock).not.toHaveBeenCalled();
  });

  it("logs 'rated' when the rating changes", async () => {
    findFirstMock.mockResolvedValue(existingItem);

    await updateLibraryItem("user-1", "item-1", { rating: 8 });

    expect(activityValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "rated", metadata: { rating: 8 } }),
    );
  });
});

describe("removeFromLibrary", () => {
  it("returns an error when nothing was deleted (not found or not owned)", async () => {
    const { db } = await import("@/lib/db");
    vi.mocked(db.delete).mockReturnValue({
      where: () => ({ returning: async () => [] }),
    } as never);

    const result = await removeFromLibrary("user-1", "item-1");

    expect(result).toEqual({
      success: false,
      error: "That item couldn't be found.",
    });
  });

  it("succeeds when a row was deleted", async () => {
    const { db } = await import("@/lib/db");
    vi.mocked(db.delete).mockReturnValue({
      where: () => ({
        returning: async () => [{ id: "item-1", mediaId: "media-1" }],
      }),
    } as never);

    const result = await removeFromLibrary("user-1", "item-1");

    expect(result).toEqual({ success: true, mediaId: "media-1" });
  });
});
