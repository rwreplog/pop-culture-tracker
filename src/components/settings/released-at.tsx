"use client";

import { useHydrated } from "@/lib/use-hydrated";

function format(releasedAt: string, timeZone?: string): string | null {
  const date = new Date(releasedAt);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  });
}

/**
 * `toLocaleString` resolves whichever timezone it runs in, so formatting
 * this server-side would show the server's timezone rather than the
 * viewer's. See useHydrated — this renders a fixed UTC string until
 * hydrated, then the browser's actual local time.
 */
export function ReleasedAt({ releasedAt }: { releasedAt: string }) {
  const hydrated = useHydrated();
  const label = format(releasedAt, hydrated ? undefined : "UTC");

  if (!label) return null;
  return <> · Released {label}</>;
}
