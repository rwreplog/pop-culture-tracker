import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { media } from "@/lib/db/schema/media";
import { users } from "@/lib/db/schema/users";

/** See docs/REQUIREMENTS.md (Activity). */
export const activityTypeEnum = pgEnum("activity_type", [
  "added",
  "started",
  "completed",
  "rated",
  "added_to_list",
  "updated_progress",
]);

/** An immutable record of a meaningful event in the user's history. */
export const activity = pgTable(
  "activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: activityTypeEnum("type").notNull(),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    /** Event-specific detail, e.g. previous/new status or rating value. */
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("activity_user_id_created_at_idx").on(table.userId, table.createdAt),
  ],
);

export const activityRelations = relations(activity, ({ one }) => ({
  user: one(users, {
    fields: [activity.userId],
    references: [users.id],
  }),
  media: one(media, {
    fields: [activity.mediaId],
    references: [media.id],
  }),
}));

export type Activity = typeof activity.$inferSelect;
export type NewActivity = typeof activity.$inferInsert;
