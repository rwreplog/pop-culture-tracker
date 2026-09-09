import { describe, expect, it } from "vitest";

import { sanitizeDescription } from "@/lib/media/sanitize-description";

describe("sanitizeDescription", () => {
  it("passes plain text through unchanged", () => {
    expect(sanitizeDescription("A quiet, unassuming plumber.")).toBe(
      "A quiet, unassuming plumber.",
    );
  });

  it("keeps basic formatting tags", () => {
    expect(
      sanitizeDescription("<p>First paragraph.</p><p>Second paragraph.</p>"),
    ).toBe("<p>First paragraph.</p><p>Second paragraph.</p>");
    expect(sanitizeDescription("<b>Bold</b> and <i>italic</i>.")).toBe(
      "<b>Bold</b> and <i>italic</i>.",
    );
  });

  it("strips script tags and event handler attributes", () => {
    expect(sanitizeDescription('<script>alert("xss")</script>Hello')).toBe(
      "Hello",
    );
    expect(sanitizeDescription('<p onclick="alert(1)">Click me</p>')).toBe(
      "<p>Click me</p>",
    );
  });

  it("only allows http/https link schemes and adds safe rel/target", () => {
    expect(
      sanitizeDescription('<a href="https://example.com">a book</a>'),
    ).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">a book</a>',
    );
    expect(sanitizeDescription('<a href="javascript:alert(1)">bad</a>')).toBe(
      '<a target="_blank" rel="noopener noreferrer">bad</a>',
    );
  });
});
