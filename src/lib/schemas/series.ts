import { z } from "zod";

import { mediaTypeEnum } from "@/lib/db/schema/media";
import { seriesGroupingModeEnum } from "@/lib/db/schema/users";

export const createSeriesSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  mediaType: z.enum(mediaTypeEnum.enumValues),
});

export const addToSeriesSchema = z.object({
  mediaId: z.uuid(),
  seriesId: z.uuid(),
});

export const removeFromSeriesSchema = z.object({
  mediaId: z.uuid(),
});

export const reorderSeriesMemberSchema = z.object({
  seriesId: z.uuid(),
  mediaId: z.uuid(),
  direction: z.enum(["up", "down"]),
});

export const seriesGroupingModeSchema = z.object({
  mode: z.enum(seriesGroupingModeEnum.enumValues),
});
