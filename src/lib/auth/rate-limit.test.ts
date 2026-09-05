import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isRateLimited, recordFailedAttempt } from "@/lib/auth/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not rate limited before any failed attempts", () => {
    expect(isRateLimited("fresh@example.com")).toBe(false);
  });

  it("rate limits after 5 failed attempts within the window", () => {
    const key = "attacker@example.com";
    for (let i = 0; i < 5; i++) recordFailedAttempt(key);
    expect(isRateLimited(key)).toBe(true);
  });

  it("does not rate limit after fewer than 5 failed attempts", () => {
    const key = "almost@example.com";
    for (let i = 0; i < 4; i++) recordFailedAttempt(key);
    expect(isRateLimited(key)).toBe(false);
  });

  it("clears the limit once the window passes", () => {
    const key = "waited@example.com";
    for (let i = 0; i < 5; i++) recordFailedAttempt(key);
    expect(isRateLimited(key)).toBe(true);

    vi.setSystemTime(61_000);
    expect(isRateLimited(key)).toBe(false);
  });

  it("tracks separate keys independently", () => {
    for (let i = 0; i < 5; i++) recordFailedAttempt("a@example.com");
    expect(isRateLimited("a@example.com")).toBe(true);
    expect(isRateLimited("b@example.com")).toBe(false);
  });
});
