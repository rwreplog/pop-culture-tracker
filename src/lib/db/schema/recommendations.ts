import { relations } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { media } from "@/lib/db/schema/media";
import { users } from "@/lib/db/schema/users";

/**
 * One user recommending a specific media item to a friend. See
 * docs/DATA_MODEL.md and docs/ROADMAP.md (Phase 6, "Recommendations
 * between users").
 */
export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recommenderId: uuid("recommender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.recommenderId, table.recipientId, table.mediaId),
    check(
      "recommendations_no_self_recommendation",
      sql`${table.recommenderId} <> ${table.recipientId}`,
    ),
    index("recommendations_recipient_id_idx").on(table.recipientId),
  ],
);

export const recommendationRelations = relations(
  recommendations,
  ({ one }) => ({
    recommender: one(users, {
      fields: [recommendations.recommenderId],
      references: [users.id],
      relationName: "recommender",
    }),
    recipient: one(users, {
      fields: [recommendations.recipientId],
      references: [users.id],
      relationName: "recipient",
    }),
    media: one(media, {
      fields: [recommendations.mediaId],
      references: [media.id],
    }),
  }),
);

export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;
