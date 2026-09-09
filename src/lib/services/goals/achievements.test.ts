import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Transaction } from "@/lib/db";

const goalsFindManyMock = vi.fn();
const libraryItemsFindManyMock = vi.fn();
const updateSetWhereMock = vi.fn();
const createNotificationMock = vi.fn();

vi.mock("@/lib/services/notifications/mutations", () => ({
  createGoalAchievedNotification: createNotificationMock,
}));

const { notifyGoalAchievements } =
  await import("@/lib/services/goals/achievements");

function fakeTx() {
  return {
    query: {
      goals: { findMany: goalsFindManyMock },
      libraryItems: { findMany: libraryItemsFindManyMock },
    },
    update: () => ({
      set: (vals: unknown) => ({
        where: async () => updateSetWhereMock(vals),
      }),
    }),
  } as unknown as Transaction;
}

const USER_ID = "user-1";

function completedItem() {
  return {
    status: "completed",
    completedAt: new Date(2024, 5, 1),
    media: { mediaType: "movie", metadata: null },
  };
}

beforeEach(() => {
  goalsFindManyMock.mockReset();
  libraryItemsFindManyMock.mockReset();
  updateSetWhereMock.mockReset();
  createNotificationMock.mockReset();
});

describe("notifyGoalAchievements", () => {
  it("does nothing when there are no un-celebrated goals for the year", async () => {
    goalsFindManyMock.mockResolvedValue([]);

    await notifyGoalAchievements(fakeTx(), USER_ID, 2024);

    expect(libraryItemsFindManyMock).not.toHaveBeenCalled();
    expect(createNotificationMock).not.toHaveBeenCalled();
  });

  it("notifies and marks a goal achieved once its target is reached", async () => {
    goalsFindManyMock.mockResolvedValue([
      { id: "goal-1", year: 2024, target: 1, mediaType: null, genre: null },
    ]);
    libraryItemsFindManyMock.mockResolvedValue([completedItem()]);

    await notifyGoalAchievements(fakeTx(), USER_ID, 2024);

    expect(updateSetWhereMock).toHaveBeenCalledWith(
      expect.objectContaining({ achievedNotifiedAt: expect.any(Date) }),
    );
    expect(createNotificationMock).toHaveBeenCalledWith(expect.anything(), {
      userId: USER_ID,
      goalId: "goal-1",
    });
  });

  it("doesn't notify a goal whose target isn't reached yet", async () => {
    goalsFindManyMock.mockResolvedValue([
      { id: "goal-1", year: 2024, target: 5, mediaType: null, genre: null },
    ]);
    libraryItemsFindManyMock.mockResolvedValue([completedItem()]);

    await notifyGoalAchievements(fakeTx(), USER_ID, 2024);

    expect(createNotificationMock).not.toHaveBeenCalled();
    expect(updateSetWhereMock).not.toHaveBeenCalled();
  });
});
