import sanitizeHtml from "sanitize-html";

/**
 * Descriptions come from external provider APIs. Google Books in particular
 * often returns real markup (paragraphs, bold/italic, line breaks); other
 * providers return plain text, which passes through unchanged since there's
 * nothing to strip. Always sanitizing before rendering as HTML means a
 * provider response can't inject a script tag or an event handler attribute.
 */
export function sanitizeDescription(description: string): string {
  return sanitizeHtml(description, {
    allowedTags: [
      "p",
      "br",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });
}
