import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/** Initial media types. See docs/PRODUCT.md. */
export const mediaTypeEnum = pgEnum("media_type", [
  "movie",
  "tv",
  "game",
  "book",
  "comic",
]);

/**
 * Canonical media, shared across all users. A user's relationship to a
 * media item lives on LibraryItem, never here. See docs/DATA_MODEL.md.
 */
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  mediaType: mediaTypeEnum("media_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  releaseDate: date("release_date"),
  imageUrl: text("image_url"),
  /** Media-type-specific fields not worth first-class columns (e.g. runtime, platform, page count). */
  metadata: jsonb("metadata"),
  /**
   * Self-referential: when set, this row is one installment of the series
   * identified by that other `media` row (e.g. "The Two Towers" pointing
   * at "The Lord of the Rings"). A row is "a series" purely by having
   * other rows point at it — the parent is an ordinary, user-created
   * `media` row with no provider link of its own. See docs/DATA_MODEL.md.
   */
  seriesId: uuid("series_id").references((): AnyPgColumn => media.id),
  /** This row's position within its series (1, 2, 3, ...). Null outside a series. */
  seriesPosition: integer("series_position"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Maps a canonical media item to its id on an external provider
 * (e.g. TMDB, IGDB). A provider id is only unique within that provider,
 * never globally. See docs/INTEGRATIONS.md.
 */
export const mediaExternalIds = pgTable(
  "media_external_ids",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    externalId: text("external_id").notNull(),
  },
  (table) => [unique().on(table.provider, table.externalId)],
);

export const mediaRelations = relations(media, ({ one, many }) => ({
  externalIds: many(mediaExternalIds),
  seriesParent: one(media, {
    fields: [media.seriesId],
    references: [media.id],
    relationName: "seriesMembers",
  }),
  seriesMembers: many(media, { relationName: "seriesMembers" }),
}));

export const mediaExternalIdRelations = relations(
  mediaExternalIds,
  ({ one }) => ({
    media: one(media, {
      fields: [mediaExternalIds.mediaId],
      references: [media.id],
    }),
  }),
);

export type MediaType = (typeof mediaTypeEnum.enumValues)[number];

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type MediaExternalId = typeof mediaExternalIds.$inferSelect;
export type NewMediaExternalId = typeof mediaExternalIds.$inferInsert;
