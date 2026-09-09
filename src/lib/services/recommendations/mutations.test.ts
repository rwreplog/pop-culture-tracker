import { beforeEach, describe, expect, it, vi } from "vitest";

const friendshipsFindFirstMock = vi.fn();
const txInsertMock = vi.fn();
const createNotificationMock = vi.fn();

vi.mock("@/lib/services/notifications/mutations", () => ({
  createRecommendationNotification: createNotificationMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      friendships: { findFirst: friendshipsFindFirstMock },
    },
    transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
      callback({ insert: txInsertMock }),
    ),
  },
}));

const { sendRecommendation } =
  await import("@/lib/services/recommendations/mutations");

const RECOMMENDER_ID = "recommender-id";
const RECIPIENT_ID = "recipient-id";
const MEDIA_ID = "media-id";

beforeEach(() => {
  friendshipsFindFirstMock.mockReset();
  txInsertMock.mockReset();
  createNotificationMock.mockReset();
});

describe("sendRecommendation", () => {
  it("rejects recommending to yourself", async () => {
    const result = await sendRecommendation(
      RECOMMENDER_ID,
      RECOMMENDER_ID,
      MEDIA_ID,
      null,
    );

    expect(result).toEqual({
      success: false,
      error: "You can't recommend something to yourself.",
    });
    expect(friendshipsFindFirstMock).not.toHaveBeenCalled();
  });

  it("rejects recommending to a non-friend", async () => {
    friendshipsFindFirstMock.mockResolvedValue(undefined);

    const result = await sendRecommendation(
      RECOMMENDER_ID,
      RECIPIENT_ID,
      MEDIA_ID,
      null,
    );

    expect(result).toEqual({
      success: false,
      error: "You can only recommend titles to friends.",
    });
    expect(txInsertMock).not.toHaveBeenCalled();
  });

  it("creates a recommendation and notifies the recipient", async () => {
    friendshipsFindFirstMock.mockResolvedValue({ id: "friendship-1" });
    txInsertMock.mockReturnValue({
      values: () => ({
        onConflictDoNothing: () => ({
          returning: async () => [{ id: "new-recommendation-id" }],
        }),
      }),
    });

    const result = await sendRecommendation(
      RECOMMENDER_ID,
      RECIPIENT_ID,
      MEDIA_ID,
      "You'd love this",
    );

    expect(result).toEqual({ success: true });
    expect(createNotificationMock).toHaveBeenCalledWith(expect.anything(), {
      userId: RECIPIENT_ID,
      actorId: RECOMMENDER_ID,
      recommendationId: "new-recommendation-id",
    });
  });

  it("no-ops without notifying on a duplicate recommendation", async () => {
    friendshipsFindFirstMock.mockResolvedValue({ id: "friendship-1" });
    txInsertMock.mockReturnValue({
      values: () => ({
        onConflictDoNothing: () => ({
          returning: async () => [],
        }),
      }),
    });

    const result = await sendRecommendation(
      RECOMMENDER_ID,
      RECIPIENT_ID,
      MEDIA_ID,
      null,
    );

    expect(result).toEqual({ success: true });
    expect(createNotificationMock).not.toHaveBeenCalled();
  });
});
