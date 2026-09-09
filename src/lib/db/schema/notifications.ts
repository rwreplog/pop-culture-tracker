import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { friendships } from "@/lib/db/schema/friendships";
import { recommendations } from "@/lib/db/schema/recommendations";
import { users } from "@/lib/db/schema/users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "friend_request",
  "recommendation",
]);

/**
 * `friendshipId`/`recommendationId` cascade on delete so removing the row
 * they point to (canceling/declining a friend request, both modeled as
 * deleting the friendship row — see friendships.ts) automatically clears
 * the notification too — no manual cleanup needed for those paths.
 * Accepting a friend request updates the row instead of deleting it, so
 * that path does need an explicit delete; see friendships/mutations.ts.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    friendshipId: uuid("friendship_id").references(() => friendships.id, {
      onDelete: "cascade",
    }),
    recommendationId: uuid("recommendation_id").references(
      () => recommendations.id,
      { onDelete: "cascade" },
    ),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_user_id_read_at_idx").on(table.userId, table.readAt),
  ],
);

export const notificationRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "recipient",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "actor",
  }),
  recommendation: one(recommendations, {
    fields: [notifications.recommendationId],
    references: [recommendations.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
