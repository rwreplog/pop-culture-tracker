import { beforeEach, describe, expect, it, vi } from "vitest";

const usersFindFirstMock = vi.fn();
const friendshipsFindFirstMock = vi.fn();
const txInsertMock = vi.fn();
const txUpdateMock = vi.fn();
const dbDeleteMock = vi.fn();
const createNotificationMock = vi.fn();
const deleteNotificationMock = vi.fn();

vi.mock("@/lib/services/notifications/mutations", () => ({
  createFriendRequestNotification: createNotificationMock,
  deleteNotificationForFriendship: deleteNotificationMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: { findFirst: usersFindFirstMock },
      friendships: { findFirst: friendshipsFindFirstMock },
    },
    transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
      callback({ insert: txInsertMock, update: txUpdateMock }),
    ),
    delete: dbDeleteMock,
  },
}));

const { sendFriendRequest, respondToFriendRequest, removeFriendship } =
  await import("@/lib/services/friendships/mutations");

const TARGET_ID = "target-id";
const REQUESTER_ID = "requester-id";

beforeEach(() => {
  usersFindFirstMock.mockReset();
  friendshipsFindFirstMock.mockReset();
  txInsertMock.mockReset();
  txUpdateMock.mockReset();
  dbDeleteMock.mockReset();
  createNotificationMock.mockReset();
  deleteNotificationMock.mockReset();
});

describe("sendFriendRequest", () => {
  it("creates a notification for the addressee when sending a new request", async () => {
    usersFindFirstMock.mockResolvedValue({ id: TARGET_ID });
    friendshipsFindFirstMock.mockResolvedValue(undefined);
    txInsertMock.mockReturnValue({
      values: () => ({
        returning: async () => [{ id: "new-friendship-id" }],
      }),
    });

    const result = await sendFriendRequest(REQUESTER_ID, "target-handle");

    expect(result).toEqual({ success: true });
    expect(createNotificationMock).toHaveBeenCalledWith(expect.anything(), {
      userId: TARGET_ID,
      actorId: REQUESTER_ID,
      friendshipId: "new-friendship-id",
    });
    expect(deleteNotificationMock).not.toHaveBeenCalled();
  });

  it("deletes the caller's own notification when auto-accepting a reverse request", async () => {
    usersFindFirstMock.mockResolvedValue({ id: TARGET_ID });
    friendshipsFindFirstMock.mockResolvedValue({
      id: "existing-friendship-id",
      requesterId: TARGET_ID,
      addresseeId: REQUESTER_ID,
      status: "pending",
    });
    txUpdateMock.mockReturnValue({
      set: () => ({ where: async () => undefined }),
    });

    const result = await sendFriendRequest(REQUESTER_ID, "target-handle");

    expect(result).toEqual({ success: true });
    expect(deleteNotificationMock).toHaveBeenCalledWith(
      expect.anything(),
      "existing-friendship-id",
    );
    expect(createNotificationMock).not.toHaveBeenCalled();
  });
});

describe("respondToFriendRequest", () => {
  it("deletes the notification on accept, since the row is updated not deleted", async () => {
    txUpdateMock.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: async () => [{ id: "friendship-1" }],
        }),
      }),
    });

    const result = await respondToFriendRequest("user-1", "friendship-1", true);

    expect(result).toEqual({ success: true });
    expect(deleteNotificationMock).toHaveBeenCalledWith(
      expect.anything(),
      "friendship-1",
    );
  });

  it("doesn't touch notifications on decline — FK cascade handles it", async () => {
    dbDeleteMock.mockReturnValue({
      where: () => ({
        returning: async () => [{ id: "friendship-1" }],
      }),
    });

    const result = await respondToFriendRequest(
      "user-1",
      "friendship-1",
      false,
    );

    expect(result).toEqual({ success: true });
    expect(deleteNotificationMock).not.toHaveBeenCalled();
    expect(createNotificationMock).not.toHaveBeenCalled();
  });
});

describe("removeFriendship", () => {
  it("doesn't touch notifications — FK cascade handles it", async () => {
    dbDeleteMock.mockReturnValue({
      where: () => ({
        returning: async () => [{ id: "friendship-1" }],
      }),
    });

    const result = await removeFriendship("user-1", "friendship-1");

    expect(result).toEqual({ success: true });
    expect(deleteNotificationMock).not.toHaveBeenCalled();
  });
});
