import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Appearance mode. "system" follows the device's OS-level preference. */
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

/**
 * Brand accent hue. Each maps to a single --hue value in globals.css — see
 * "Accent themes" in docs/DESIGN_SYSTEM.md.
 */
export const accentColorEnum = pgEnum("accent_color", [
  "blue",
  "violet",
  "emerald",
  "amber",
]);

/** Single font used for both headings and body text — see globals.css's --font-app. */
export const fontFamilyEnum = pgEnum("font_family", [
  "space-grotesk",
  "bricolage-grotesque",
  "manrope",
  "sora",
]);

/**
 * How adding a series member to the library behaves — see docs/DATA_MODEL.md
 * (Media.seriesId). Both modes read the same series data; switching this
 * only changes future adds/display, never merges or discards existing
 * library items either direction.
 *
 * - "grouped": each item keeps its own library item (status/rating/notes);
 *   2+ present in the same view collapse into one summary card.
 * - "unified": adding a series member adds the series itself instead, with
 *   one status/rating/notes for the whole set — tracked like a TV show's
 *   season/episode, but "book 2 of 3" instead.
 */
export const seriesGroupingModeEnum = pgEnum("series_grouping_mode", [
  "grouped",
  "unified",
]);

/**
 * Column names follow Auth.js's Drizzle adapter conventions
 * (name/email/emailVerified/image) so authentication can be wired up
 * without a custom adapter mapping. See docs/DATA_MODEL.md (User).
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  /** Null for users who only ever sign in via an OAuth provider. */
  passwordHash: text("password_hash"),
  /**
   * Public, URL-safe identifier (see /u/[handle]). Nullable: it's generated
   * right after account creation (registerUser for credentials sign-up,
   * the createUser auth event for OAuth sign-up) rather than at insert
   * time, since the OAuth path's row is created by DrizzleAdapter itself
   * and can't be given extra columns at that point.
   */
  handle: text("handle").unique(),
  bio: text("bio"),
  theme: themeEnum("theme").notNull().default("system"),
  accentColor: accentColorEnum("accent_color").notNull().default("blue"),
  fontFamily: fontFamilyEnum("font_family").notNull().default("space-grotesk"),
  seriesGroupingMode: seriesGroupingModeEnum("series_grouping_mode")
    .notNull()
    .default("grouped"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
