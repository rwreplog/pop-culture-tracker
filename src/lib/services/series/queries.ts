import { and, eq, exists, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema/media";
import type { Media, MediaType } from "@/lib/db/schema/media";

/**
 * Existing series of a given media type — rows other `media` rows point
 * at via `seriesId` — for the "add to an existing series" picker on the
 * media detail page. A row only counts once it has a member, so a media
 * row that merely *could* become a series (any row can) doesn't show up
 * as an option until someone's actually added something to it.
 */
export async function listSeriesForMediaType(mediaType: MediaType) {
  const child = alias(media, "child");
  return db
    .select({ id: media.id, title: media.title })
    .from(media)
    .where(
      and(
        eq(media.mediaType, mediaType),
        exists(
          db
            .select({ one: child.id })
            .from(child)
            .where(eq(child.seriesId, media.id)),
        ),
      ),
    )
    .orderBy(media.title);
}

/** A series' parent row plus its members, ordered by seriesPosition. */
export async function getSeriesById(seriesId: string) {
  const series = await db.query.media.findFirst({
    where: eq(media.id, seriesId),
  });
  if (!series) return null;

  const members = await db.query.media.findMany({
    where: eq(media.seriesId, seriesId),
    orderBy: (item, { asc }) => [asc(item.seriesPosition)],
  });

  return { series, members };
}

export type SeriesGroup<T> = {
  seriesId: string;
  seriesTitle: string;
  /** Members present in `items`, ordered by seriesPosition — not
   * necessarily every member of the series, just the ones the caller's
   * result set actually contains (e.g. after a status/search filter). */
  members: T[];
};

export type GroupedLibraryItems<T> =
  { kind: "standalone"; item: T } | { kind: "series"; group: SeriesGroup<T> };

/**
 * Partitions an already-fetched list of library items (each with its
 * `media` joined in) into standalone items and series groups, wherever
 * 2+ items in *this specific list* share a `media.seriesId`. Pure
 * function, same idiom as `rankBacklog` — re-groups correctly under
 * whatever filter/search produced `items`, since a lone series member
 * with no library-mates present just renders as a standalone item.
 *
 * `seriesTitles` maps seriesId -> the parent media row's own title (the
 * series' name); see `fetchSeriesTitles` for the one batched query that
 * builds it. Kept as a separate injected lookup rather than fetched in
 * here so this function stays a pure, easily-unit-tested partition.
 */
export function groupLibraryItemsBySeries<
  T extends {
    media: Pick<Media, "id" | "title" | "seriesId" | "seriesPosition">;
  },
>(items: T[], seriesTitles: Map<string, string>): GroupedLibraryItems<T>[] {
  const bySeriesId = new Map<string, T[]>();
  for (const item of items) {
    const seriesId = item.media.seriesId;
    if (!seriesId) continue;
    const group = bySeriesId.get(seriesId);
    if (group) group.push(item);
    else bySeriesId.set(seriesId, [item]);
  }

  const seriesIdsToGroup = new Set(
    [...bySeriesId.entries()]
      .filter(([, members]) => members.length >= 2)
      .map(([seriesId]) => seriesId),
  );
  if (seriesIdsToGroup.size === 0) {
    return items.map((item) => ({ kind: "standalone", item }));
  }

  const result: GroupedLibraryItems<T>[] = [];
  const emitted = new Set<string>();

  for (const item of items) {
    const seriesId = item.media.seriesId;
    if (!seriesId || !seriesIdsToGroup.has(seriesId)) {
      result.push({ kind: "standalone", item });
      continue;
    }
    if (emitted.has(seriesId)) continue;
    emitted.add(seriesId);

    const members = [...(bySeriesId.get(seriesId) ?? [])].sort(
      (a, b) => (a.media.seriesPosition ?? 0) - (b.media.seriesPosition ?? 0),
    );
    result.push({
      kind: "series",
      group: {
        seriesId,
        seriesTitle: seriesTitles.get(seriesId) ?? members[0].media.title,
        members,
      },
    });
  }

  return result;
}

/**
 * One batched lookup of the parent media rows' titles for a set of
 * seriesIds, for `groupLibraryItemsBySeries`. Callers gather the
 * distinct `media.seriesId`s present in whatever list they already
 * fetched and pass them here — a single `IN (...)` query regardless of
 * how many series are present.
 */
export async function fetchSeriesTitles(
  seriesIds: string[],
): Promise<Map<string, string>> {
  if (seriesIds.length === 0) return new Map();
  const rows = await db
    .select({ id: media.id, title: media.title })
    .from(media)
    .where(inArray(media.id, seriesIds));
  return new Map(rows.map((row) => [row.id, row.title]));
}
