import { z } from "zod";

import { mediaTypeEnum } from "@/lib/db/schema/media";

/** The mediaType Select can't hold an empty-string option, so "Any type" submits this sentinel. */
export const ANY_MEDIA_TYPE = "any";

function emptyToNull(value: unknown) {
  return typeof value === "string" && value === "" ? null : value;
}

function mediaTypeToNull(value: unknown) {
  return value === ANY_MEDIA_TYPE ? null : emptyToNull(value);
}

const CURRENT_YEAR = new Date().getFullYear();

export const createGoalSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(CURRENT_YEAR - 1)
    .max(CURRENT_YEAR + 5),
  target: z.coerce.number().int().min(1).max(1000),
  mediaType: z.preprocess(
    mediaTypeToNull,
    z.enum(mediaTypeEnum.enumValues).nullable(),
  ),
  genre: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
});

export const deleteGoalSchema = z.object({
  goalId: z.uuid(),
});
