"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Collapsed height, in pixels — roughly 6 lines of body text. */
const COLLAPSED_HEIGHT = 144;

/**
 * Renders sanitized description HTML (see sanitizeDescription's caller),
 * collapsed to a fixed height with a Show more/Show less toggle when the
 * content overflows it. Measures actual content height rather than relying
 * on line-clamp, since descriptions can include lists/paragraphs the
 * webkit-line-clamp heuristics don't handle cleanly.
 */
export function MediaDescription({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setOverflows(el.scrollHeight > COLLAPSED_HEIGHT + 1);
  }, [html]);

  return (
    <div className="flex flex-col gap-2">
      <div
        style={!expanded ? { maxHeight: COLLAPSED_HEIGHT } : undefined}
        className="overflow-hidden"
      >
        <div
          ref={contentRef}
          className="[&_a:hover]:text-foreground flex flex-col gap-3 text-sm [&_a]:underline [&_a]:underline-offset-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {overflows ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={cn(
            "text-muted-foreground hover:text-foreground self-start text-xs font-medium hover:underline",
          )}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
