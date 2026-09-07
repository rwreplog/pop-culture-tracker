import { describe, expect, it } from "vitest";

import { slugifyHandle } from "@/lib/services/users/handle";

describe("slugifyHandle", () => {
  it("lowercases and keeps alphanumerics as-is", () => {
    expect(slugifyHandle("JaneDoe123")).toBe("janedoe123");
  });

  it("replaces runs of non-alphanumeric characters with a single hyphen", () => {
    expect(slugifyHandle("Jane   Doe!!")).toBe("jane-doe");
  });

  it("keeps only the local part of an email", () => {
    expect(slugifyHandle("jane.doe@example.com")).toBe("jane-doe");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugifyHandle("--jane--")).toBe("jane");
  });

  it("falls back to a default when nothing usable remains", () => {
    expect(slugifyHandle("!!!")).toBe("user");
    expect(slugifyHandle("")).toBe("user");
  });

  it("truncates to 30 characters", () => {
    const long = "a".repeat(50);
    expect(slugifyHandle(long)).toHaveLength(30);
  });
});
