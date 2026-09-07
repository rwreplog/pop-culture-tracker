import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
