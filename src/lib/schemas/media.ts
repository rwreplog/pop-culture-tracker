import { z } from "zod";

export const mediaSearchSchema = z.object({
  query: z.string().trim().min(1, "Enter a search term"),
  mediaType: z.enum(["movie", "tv", "game", "book", "comic"]),
});

export type MediaSearchInput = z.infer<typeof mediaSearchSchema>;
