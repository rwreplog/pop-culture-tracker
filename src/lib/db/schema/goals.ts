import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { mediaTypeEnum } from "@/lib/db/schema/media";
import { users } from "@/lib/db/schema/users";

/**
 * A user-defined target of N items completed within a calendar year,
 * optionally narrowed to a media type and/or genre. Progress is computed
 * on read from LibraryItem (see services/goals/progress.ts) rather than
 * stored, so it always reflects the current library state.
 */
export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    target: integer("target").notNull(),
    /** Null matches any media type. */
    mediaType: mediaTypeEnum("media_type"),
    /** Null matches any genre. Freeform, matched case-insensitively against Media.metadata.genres. */
    genre: text("genre"),
    /**
     * Set once a completion has pushed this goal's progress to (or past)
     * its target and a celebratory notification has been sent for it — so
     * a goal is only ever celebrated once, not re-fired on every future
     * read. See services/goals/achievements.ts.
     */
    achievedNotifiedAt: timestamp("achieved_notified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("goals_user_id_idx").on(table.userId)],
);

export const goalRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
