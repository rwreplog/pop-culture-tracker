import { z } from "zod";

function emptyToNull(value: unknown) {
  return typeof value === "string" && value === "" ? null : value;
}

/** Lowercase, URL-safe, matches the shape generateUniqueHandle produces. */
const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,29})$/;

export const updateProfileSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      HANDLE_PATTERN,
      "Handle must be lowercase letters, numbers, and hyphens only",
    ),
  bio: z.preprocess(emptyToNull, z.string().trim().max(280).nullable()),
});
