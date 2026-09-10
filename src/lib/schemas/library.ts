import { z } from "zod";

import { libraryStatusEnum } from "@/lib/db/schema/library";

export const libraryStatusSchema = z.enum(libraryStatusEnum.enumValues);

/**
 * Progress is media-type-aware and validated at the application boundary
 * (not the DB) since its shape differs per type. See docs/DATA_MODEL.md.
 * Movie is intentionally omitted — docs/REQUIREMENTS.md only calls out
 * progress for TV/book/game/comic.
 */
export const libraryProgressSchema = z.discriminatedUnion("mediaType", [
  z.object({
    mediaType: z.literal("tv"),
    season: z.coerce.number().int().positive(),
    episode: z.coerce.number().int().positive(),
  }),
  z.object({
    mediaType: z.literal("book"),
    page: z.coerce.number().int().nonnegative().optional(),
    percent: z.coerce.number().min(0).max(100).optional(),
  }),
  z.object({
    mediaType: z.literal("game"),
    percent: z.coerce.number().min(0).max(100).optional(),
    note: z.string().max(200).optional(),
  }),
  z.object({
    mediaType: z.literal("comic"),
    issue: z.coerce.number().int().positive().optional(),
    volume: z.coerce.number().int().positive().optional(),
  }),
]);

export type LibraryProgress = z.infer<typeof libraryProgressSchema>;

export const addToLibrarySchema = z.object({
  mediaId: z.uuid(),
  status: libraryStatusSchema,
});

export const updateStatusSchema = z.object({
  libraryItemId: z.uuid(),
  status: libraryStatusSchema,
});

export const updateRatingSchema = z.object({
  libraryItemId: z.uuid(),
  // Empty string or "none" clears the rating.
  rating: z.preprocess(
    (v) => (v === "" || v === "none" ? null : v),
    z.coerce.number().int().min(0).max(10).nullable(),
  ),
});

export const updateNotesSchema = z.object({
  libraryItemId: z.uuid(),
  notes: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().max(2000).nullable(),
  ),
});

export const toggleFavoriteSchema = z.object({
  libraryItemId: z.uuid(),
  isFavorite: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export const updateProgressSchema = z.object({
  libraryItemId: z.uuid(),
  progress: libraryProgressSchema,
});

/** "Unified" series-grouping mode only — which installment the user is currently on. */
export const updateSeriesCurrentPositionSchema = z.object({
  libraryItemId: z.uuid(),
  seriesCurrentPosition: z.coerce.number().int().positive(),
});

export const removeFromLibrarySchema = z.object({
  libraryItemId: z.uuid(),
});

export const updateCompletedAtSchema = z.object({
  libraryItemId: z.uuid(),
  completedAt: z.preprocess(
    (v) => (v === "" ? null : v),
    z.coerce.date().nullable(),
  ),
});

export const uploadCustomArtSchema = z.object({
  libraryItemId: z.uuid(),
  file: z.instanceof(File),
});

export const removeCustomArtSchema = z.object({
  libraryItemId: z.uuid(),
});
