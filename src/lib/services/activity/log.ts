import type { Transaction } from "@/lib/db";
import { activity } from "@/lib/db/schema/activity";
import type { activityTypeEnum } from "@/lib/db/schema/activity";

type ActivityType = (typeof activityTypeEnum.enumValues)[number];

/**
 * Records an activity event within the same transaction as the mutation
 * that caused it, so an activity row never exists without its real event.
 */
export async function recordActivity(
  tx: Transaction,
  userId: string,
  type: ActivityType,
  mediaId: string,
  metadata: Record<string, unknown> | null = null,
): Promise<void> {
  await tx.insert(activity).values({ userId, type, mediaId, metadata });
}
