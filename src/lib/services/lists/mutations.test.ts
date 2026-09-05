import { beforeEach, describe, expect, it, vi } from "vitest";

const listsFindFirstMock = vi.fn();
const listItemsFindManyMock = vi.fn();
const updateSetMock = vi.fn();
const deleteReturningMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    transaction: vi.fn(async (callback: (tx: unknown) => unknown) => {
      const tx = {
        query: {
          lists: { findFirst: listsFindFirstMock },
          listItems: { findMany: listItemsFindManyMock },
        },
        update: () => ({
          set: (vals: unknown) => ({
            where: async () => {
              updateSetMock(vals);
            },
          }),
        }),
        delete: () => ({
          where: () => ({
            returning: async () => deleteReturningMock(),
          }),
        }),
      };
      return callback(tx);
    }),
  },
}));

const { reorderListItem, removeItemFromList } = await import(
  "@/lib/services/lists/mutations"
);

beforeEach(() => {
  listsFindFirstMock.mockReset();
  listItemsFindManyMock.mockReset();
  updateSetMock.mockReset();
  deleteReturningMock.mockReset();
});

const ITEMS = [
  { id: "item-a", position: 0 },
  { id: "item-b", position: 1 },
  { id: "item-c", position: 2 },
];

describe("reorderListItem", () => {
  it("rejects when the list isn't owned by the user", async () => {
    listsFindFirstMock.mockResolvedValue(undefined);

    const result = await reorderListItem("user-1", "list-1", "item-b", "up");

    expect(result).toEqual({
      success: false,
      error: "That list couldn't be found.",
    });
  });

  it("swaps positions with the previous item when moving up", async () => {
    listsFindFirstMock.mockResolvedValue({ id: "list-1" });
    listItemsFindManyMock.mockResolvedValue(ITEMS);

    const result = await reorderListItem("user-1", "list-1", "item-b", "up");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).toHaveBeenNthCalledWith(1, { position: 0 }); // item-b takes item-a's position
    expect(updateSetMock).toHaveBeenNthCalledWith(2, { position: 1 }); // item-a takes item-b's position
  });

  it("swaps positions with the next item when moving down", async () => {
    listsFindFirstMock.mockResolvedValue({ id: "list-1" });
    listItemsFindManyMock.mockResolvedValue(ITEMS);

    const result = await reorderListItem("user-1", "list-1", "item-b", "down");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).toHaveBeenNthCalledWith(1, { position: 2 });
    expect(updateSetMock).toHaveBeenNthCalledWith(2, { position: 1 });
  });

  it("is a no-op when already at the top", async () => {
    listsFindFirstMock.mockResolvedValue({ id: "list-1" });
    listItemsFindManyMock.mockResolvedValue(ITEMS);

    const result = await reorderListItem("user-1", "list-1", "item-a", "up");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).not.toHaveBeenCalled();
  });

  it("is a no-op when already at the bottom", async () => {
    listsFindFirstMock.mockResolvedValue({ id: "list-1" });
    listItemsFindManyMock.mockResolvedValue(ITEMS);

    const result = await reorderListItem("user-1", "list-1", "item-c", "down");

    expect(result).toEqual({ success: true });
    expect(updateSetMock).not.toHaveBeenCalled();
  });
});

describe("removeItemFromList", () => {
  it("rejects when the list isn't owned by the user", async () => {
    listsFindFirstMock.mockResolvedValue(undefined);

    const result = await removeItemFromList("user-1", "list-1", "item-a");

    expect(result).toEqual({
      success: false,
      error: "That list couldn't be found.",
    });
  });

  it("rejects when the item isn't in the list", async () => {
    listsFindFirstMock.mockResolvedValue({ id: "list-1" });
    deleteReturningMock.mockResolvedValue([]);

    const result = await removeItemFromList("user-1", "list-1", "item-a");

    expect(result).toEqual({
      success: false,
      error: "That item couldn't be found in the list.",
    });
  });

  it("succeeds when the item is removed", async () => {
    listsFindFirstMock.mockResolvedValue({ id: "list-1" });
    deleteReturningMock.mockResolvedValue([{ id: "item-a" }]);

    const result = await removeItemFromList("user-1", "list-1", "item-a");

    expect(result).toEqual({ success: true });
  });
});
