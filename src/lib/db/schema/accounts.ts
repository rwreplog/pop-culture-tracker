import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

import { users } from "@/lib/db/schema/users";

/**
 * Links an OAuth provider account (e.g. Google) to a User. Shape follows
 * Auth.js's Drizzle adapter conventions. Not used for the credentials
 * (email/password) sign-in method — see users.passwordHash.
 */
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ],
);

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
