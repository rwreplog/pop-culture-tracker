import { z } from "zod";

function emptyToNull(value: unknown) {
  return typeof value === "string" && value === "" ? null : value;
}

export const createListSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.preprocess(
    emptyToNull,
    z.string().trim().max(500).nullable(),
  ),
});

export const renameListSchema = z.object({
  listId: z.uuid(),
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.preprocess(
    emptyToNull,
    z.string().trim().max(500).nullable(),
  ),
});

export const deleteListSchema = z.object({
  listId: z.uuid(),
});

export const addItemToListSchema = z.object({
  listId: z.uuid(),
  mediaId: z.uuid(),
});

export const removeItemFromListSchema = z.object({
  listId: z.uuid(),
  listItemId: z.uuid(),
});

export const reorderListItemSchema = z.object({
  listId: z.uuid(),
  listItemId: z.uuid(),
  direction: z.enum(["up", "down"]),
});
