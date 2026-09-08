export const SKIP_COOKIE_NAME = "tonight_skips";
/** Keyed by "provider:externalId" rather than a library item id — see external.ts. */
export const SURPRISE_SKIP_COOKIE_NAME = "surprise_skips";

const SKIP_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 50;

export const SKIP_COOKIE_MAX_AGE_SECONDS = SKIP_TTL_MS / 1000;

type SkipEntry = { id: string; skippedAt: number };

function parseEntries(raw: string | undefined): SkipEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is SkipEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as SkipEntry).id === "string" &&
        typeof (entry as SkipEntry).skippedAt === "number",
    );
  } catch {
    return [];
  }
}

function pruneExpired(entries: SkipEntry[]): SkipEntry[] {
  const cutoff = Date.now() - SKIP_TTL_MS;
  return entries.filter((entry) => entry.skippedAt > cutoff);
}

/** Recently-skipped library item ids from a raw `tonight_skips` cookie value, expired entries dropped. */
export function getSkippedIds(raw: string | undefined): Set<string> {
  return new Set(pruneExpired(parseEntries(raw)).map((entry) => entry.id));
}

/**
 * Adds a skip to a raw `tonight_skips` cookie value, dropping expired
 * entries and capping history so the cookie can't grow unbounded.
 */
export function addSkip(
  raw: string | undefined,
  libraryItemId: string,
): string {
  const entries = pruneExpired(parseEntries(raw));
  entries.push({ id: libraryItemId, skippedAt: Date.now() });
  return JSON.stringify(entries.slice(-MAX_ENTRIES));
}
