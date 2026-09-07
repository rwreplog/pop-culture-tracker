import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  handle: z.string().trim().toLowerCase().min(1, "Enter a handle"),
});

export const respondFriendRequestSchema = z.object({
  friendshipId: z.uuid(),
  accept: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export const removeFriendshipSchema = z.object({
  friendshipId: z.uuid(),
});
