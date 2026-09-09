import { z } from "zod";

function emptyToNull(value: unknown) {
  return typeof value === "string" && value === "" ? null : value;
}

export const sendRecommendationSchema = z.object({
  recipientId: z.uuid(),
  mediaId: z.uuid(),
  note: z.preprocess(emptyToNull, z.string().trim().max(500).nullable()),
});
