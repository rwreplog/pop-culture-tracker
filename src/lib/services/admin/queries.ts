import { count, notIlike, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { activity } from "@/lib/db/schema/activity";
import { libraryItems } from "@/lib/db/schema/library";
import { lists } from "@/lib/db/schema/lists";

export type AdminAccountOverview = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  itemCount: number;
  listCount: number;
  lastActiveAt: Date | null;
};

/**
 * Every account with basic usage counts, for the admin overview page.
 * Counts are computed as separate grouped aggregates (rather than joining
 * library_items and lists onto users in one query) to avoid row fan-out —
 * a join across two one-to-many tables would multiply row counts together.
 */
export async function getAdminAccountsOverview(): Promise<
  AdminAccountOverview[]
> {
  const [accounts, itemCounts, listCounts, lastActive] = await Promise.all([
    db.query.users.findMany({
      // e2e/manual test accounts are all registered under @example.com
      // (see e2e/helpers.ts's uniqueTestUser), sometimes with a variant
      // suffix tacked on after it (e.g. "...@example.com.dark") — filter
      // anything containing that domain so they don't crowd out real
      // accounts on the overview.
      where: (user) => notIlike(user.email, "%@example.com%"),
      orderBy: (user, { desc }) => [desc(user.createdAt)],
    }),
    db
      .select({ userId: libraryItems.userId, count: count() })
      .from(libraryItems)
      .groupBy(libraryItems.userId),
    db
      .select({ userId: lists.userId, count: count() })
      .from(lists)
      .groupBy(lists.userId),
    db
      .select({
        userId: activity.userId,
        // Raw sql fragments get no drizzle column mapping, so without an
        // explicit decoder this comes back as the driver's native timestamp
        // string (e.g. "2026-09-09 12:38:32.99204"), not a Date.
        lastActiveAt: sql<Date>`max(${activity.createdAt})`.mapWith(
          (value: string) => new Date(value),
        ),
      })
      .from(activity)
      .groupBy(activity.userId),
  ]);

  const itemCountByUser = new Map(
    itemCounts.map((row) => [row.userId, row.count]),
  );
  const listCountByUser = new Map(
    listCounts.map((row) => [row.userId, row.count]),
  );
  const lastActiveByUser = new Map(
    lastActive.map((row) => [row.userId, row.lastActiveAt]),
  );

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
    itemCount: itemCountByUser.get(account.id) ?? 0,
    listCount: listCountByUser.get(account.id) ?? 0,
    lastActiveAt: lastActiveByUser.get(account.id) ?? null,
  }));
}
