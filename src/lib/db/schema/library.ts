import { relations } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { media } from "@/lib/db/schema/media";
import { users } from "@/lib/db/schema/users";

/**
 * Canonical statuses. Media types may expose friendlier labels
 * (e.g. "Want to Watch", "Want to Play") at the presentation layer.
 * See docs/PRODUCT.md.
 */
export const libraryStatusEnum = pgEnum("library_status", [
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
]);

/**
 * A user's relationship to a canonical Media item: status, rating,
 * favorite, notes, and progress. See docs/DATA_MODEL.md.
 *
 * `rating` is a half-star scale stored as 0-10 (e.g. 7 = 3.5 stars).
 * `progress` is media-type-aware and validated at the application
 * boundary (see src/lib/schemas) rather than in the database, since its
 * shape differs per media type (season/episode, page, percentage, etc).
 */
export const libraryItems = pgTable(
  "library_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    status: libraryStatusEnum("status").notNull().default("want"),
    rating: smallint("rating"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    notes: text("notes"),
    progress: jsonb("progress"),
    /**
     * "Unified" series-grouping mode only ("grouped" mode never sets this):
     * when `mediaId` points at a series (a media row other rows point at
     * via seriesId), this is the seriesPosition of the installment the
     * user is currently on — e.g. 2 for "book 2 of 3". Kept as its own
     * column rather than folded into `progress`, since that column's
     * shape is validated by a per-mediaType zod discriminated union at
     * the application boundary, and an unrecognized extra key would be
     * silently stripped on the next save.
     */
    seriesCurrentPosition: integer("series_current_position"),
    /** Object key in the `custom-art` bucket for this user's custom artwork override, if set. */
    customImageKey: text("custom_image_key"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.mediaId),
    check("rating_range", sql`${table.rating} between 0 and 10`),
    index("library_items_user_id_idx").on(table.userId),
    index("library_items_user_id_status_idx").on(table.userId, table.status),
  ],
);

export const libraryItemRelations = relations(libraryItems, ({ one }) => ({
  user: one(users, {
    fields: [libraryItems.userId],
    references: [users.id],
  }),
  media: one(media, {
    fields: [libraryItems.mediaId],
    references: [media.id],
  }),
}));

export type LibraryItem = typeof libraryItems.$inferSelect;
export type NewLibraryItem = typeof libraryItems.$inferInsert;
