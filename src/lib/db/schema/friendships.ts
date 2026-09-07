import { relations } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "@/lib/db/schema/users";

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
]);

/**
 * A mutual friendship, modeled as a single directed request row: the
 * requester sent it, the addressee accepts or the row is deleted (decline,
 * cancel, or unfriend all just delete the row — there's no "declined"
 * state to keep around). See docs/DATA_MODEL.md (Friendship vs Follow).
 */
export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: uuid("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.requesterId, table.addresseeId),
    index("friendships_requester_id_idx").on(table.requesterId),
    index("friendships_addressee_id_idx").on(table.addresseeId),
    check(
      "friendships_no_self_friendship",
      sql`${table.requesterId} <> ${table.addresseeId}`,
    ),
  ],
);

export const friendshipRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export type Friendship = typeof friendships.$inferSelect;
export type NewFriendship = typeof friendships.$inferInsert;
