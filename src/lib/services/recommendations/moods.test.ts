import { describe, expect, it } from "vitest";

import { getAutoMood } from "@/lib/services/recommendations/moods";

describe("getAutoMood", () => {
  it("suggests cozy late at night, any day", () => {
    expect(getAutoMood(new Date(2024, 0, 3, 23, 0))).toBe("cozy"); // Wed 11pm
    expect(getAutoMood(new Date(2024, 0, 6, 4, 59))).toBe("cozy"); // Sat 4:59am
  });

  it("suggests thoughtful on a weekend day", () => {
    expect(getAutoMood(new Date(2024, 0, 6, 14, 0))).toBe("thoughtful"); // Sat 2pm
    expect(getAutoMood(new Date(2024, 0, 7, 10, 0))).toBe("thoughtful"); // Sun 10am
  });

  it("suggests thoughtful once Friday evening starts", () => {
    expect(getAutoMood(new Date(2024, 0, 5, 17, 0))).toBe("thoughtful"); // Fri 5pm
    expect(getAutoMood(new Date(2024, 0, 5, 12, 0))).toBe("light"); // Fri noon, not yet evening
  });

  it("suggests light on an ordinary weekday", () => {
    expect(getAutoMood(new Date(2024, 0, 3, 12, 0))).toBe("light"); // Wed noon
    expect(getAutoMood(new Date(2024, 0, 3, 21, 59))).toBe("light"); // Wed 9:59pm
  });
});
