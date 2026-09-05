import { describe, expect, it } from "vitest";

import { createListSchema, renameListSchema } from "@/lib/schemas/lists";

const VALID_UUID = "11111111-1111-4111-8111-111111111111";

describe("createListSchema", () => {
  it("treats an empty description as null", () => {
    const result = createListSchema.safeParse({
      name: "Favorites",
      description: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeNull();
  });

  it("rejects an empty name", () => {
    const result = createListSchema.safeParse({ name: "", description: "" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from the name", () => {
    const result = createListSchema.safeParse({
      name: "  Favorites  ",
      description: null,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Favorites");
  });
});

describe("renameListSchema", () => {
  it("requires a valid list id", () => {
    const result = renameListSchema.safeParse({
      listId: "not-a-uuid",
      name: "New name",
      description: null,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid rename", () => {
    const result = renameListSchema.safeParse({
      listId: VALID_UUID,
      name: "New name",
      description: "Updated",
    });
    expect(result.success).toBe(true);
  });
});
