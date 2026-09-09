import { describe, expect, it } from "vitest";

import { sendRecommendationSchema } from "@/lib/schemas/recommendations";

describe("sendRecommendationSchema", () => {
  const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
  const OTHER_UUID = "223e4567-e89b-12d3-a456-426614174000";

  it("accepts a recommendation with a note", () => {
    const result = sendRecommendationSchema.safeParse({
      recipientId: VALID_UUID,
      mediaId: OTHER_UUID,
      note: "You'd love this",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("You'd love this");
    }
  });

  it("converts an empty note to null", () => {
    const result = sendRecommendationSchema.safeParse({
      recipientId: VALID_UUID,
      mediaId: OTHER_UUID,
      note: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBeNull();
    }
  });

  it("rejects a non-uuid recipientId", () => {
    const result = sendRecommendationSchema.safeParse({
      recipientId: "not-a-uuid",
      mediaId: OTHER_UUID,
      note: null,
    });
    expect(result.success).toBe(false);
  });
});
