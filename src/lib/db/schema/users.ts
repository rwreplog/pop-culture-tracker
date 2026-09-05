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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
