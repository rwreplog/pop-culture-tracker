import { and, eq, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import { activity } from "@/lib/db/schema/activity";
import type { MediaType } from "@/lib/db/schema/media";
import { getMediaCreator, getMediaGenres } from "@/lib/media/metadata";
import { getLibraryItems } from "@/lib/services/library/queries";

type LibraryItemWithMedia = Awaited<ReturnType<typeof getLibraryItems>>[number];
type LibraryStatus = LibraryItemWithMedia["status"];

export type CountEntry = { name: string; count: number };

function topEntries(counts: Map<string, number>, limit: number): CountEntry[] {
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export type StatsOverview = {
  totalItems: number;
  byStatus: Record<LibraryStatus, number>;
  byMediaType: Record<MediaType, number>;
  /** 0-10 half-star scale, averaged over rated items only. Null if none rated. */
  averageRating: number | null;
  favoritesCount: number;
  completedThisYear: number;
};

function buildOverview(items: LibraryItemWithMedia[]): StatsOverview {
  const currentYear = new Date().getFullYear();
  const byStatus: Record<LibraryStatus, number> = {
    want: 0,
    in_progress: 0,
    completed: 0,
    paused: 0,
    abandoned: 0,
  };
  const byMediaType: Record<MediaType, number> = {
    movie: 0,
    tv: 0,
    game: 0,
    book: 0,
    comic: 0,
  };
  let ratingSum = 0;
  let ratingCount = 0;
  let favoritesCount = 0;
  let completedThisYear = 0;

  for (const item of items) {
    byStatus[item.status] += 1;
    byMediaType[item.media.mediaType] += 1;
    if (item.rating != null) {
      ratingSum += item.rating;
      ratingCount += 1;
    }
    if (item.isFavorite) favoritesCount += 1;
    if (
      item.status === "completed" &&
      item.completedAt?.getFullYear() === currentYear
    ) {
      completedThisYear += 1;
    }
  }

  return {
    totalItems: items.length,
    byStatus,
    byMediaType,
    averageRating: ratingCount > 0 ? ratingSum / ratingCount : null,
    favoritesCount,
    completedThisYear,
  };
}

function buildGenreBreakdown(
  items: LibraryItemWithMedia[],
  limit: number,
): CountEntry[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const genre of getMediaGenres(item.media)) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return topEntries(counts, limit);
}

function buildTopCreators(
  items: LibraryItemWithMedia[],
  limit: number,
): CountEntry[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const creator = getMediaCreator(item.media);
    if (creator) counts.set(creator, (counts.get(creator) ?? 0) + 1);
  }
  return topEntries(counts, limit);
}

export type AnnualSummaryItem = {
  libraryItemId: string;
  mediaId: string;
  title: string;
  mediaType: MediaType;
  imageUrl: string | null;
  /** 0-10 half-star scale. */
  rating: number;
};

export type AnnualSummary = {
  year: number;
  completedCount: number;
  byMediaType: Record<MediaType, number>;
  topGenres: CountEntry[];
  topRated: AnnualSummaryItem[];
};

const TOP_RATED_LIMIT = 5;

function buildAnnualSummary(
  items: LibraryItemWithMedia[],
  year: number,
): AnnualSummary {
  const completedThisYear = items.filter(
    (item) =>
      item.status === "completed" && item.completedAt?.getFullYear() === year,
  );

  const byMediaType: Record<MediaType, number> = {
    movie: 0,
    tv: 0,
    game: 0,
    book: 0,
    comic: 0,
  };
  for (const item of completedThisYear) {
    byMediaType[item.media.mediaType] += 1;
  }

  const topRated = completedThisYear
    .filter(
      (item): item is LibraryItemWithMedia & { rating: number } =>
        item.rating != null,
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, TOP_RATED_LIMIT)
    .map((item) => ({
      libraryItemId: item.id,
      mediaId: item.mediaId,
      title: item.media.title,
      mediaType: item.media.mediaType,
      imageUrl: item.media.imageUrl,
      rating: item.rating,
    }));

  return {
    year,
    completedCount: completedThisYear.length,
    byMediaType,
    topGenres: buildGenreBreakdown(completedThisYear, 3),
    topRated,
  };
}

export type InsightsData = {
  overview: StatsOverview;
  genreBreakdown: CountEntry[];
  topCreators: CountEntry[];
  annualSummary: AnnualSummary;
};

const BREAKDOWN_LIMIT = 8;

/**
 * All Stats-page data for a user, computed from a single library fetch.
 * Fine at MVP's per-user scale — see getLibraryItems/getDashboardSections.
 */
export async function getInsights(
  userId: string,
  year: number = new Date().getFullYear(),
): Promise<InsightsData> {
  const items = await getLibraryItems(userId);

  return {
    overview: buildOverview(items),
    genreBreakdown: buildGenreBreakdown(items, BREAKDOWN_LIMIT),
    topCreators: buildTopCreators(items, BREAKDOWN_LIMIT),
    annualSummary: buildAnnualSummary(items, year),
  };
}

export type MonthlyActivity = { month: string; count: number };

/**
 * Activity counts bucketed by calendar month, oldest first, for the
 * trailing `months` months (including the current one). Months with no
 * activity are included with a zero count so charts render a full axis.
 */
export async function getActivityChartData(
  userId: string,
  months = 6,
): Promise<MonthlyActivity[]> {
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - (months - 1));

  const rows = await db.query.activity.findMany({
    where: and(eq(activity.userId, userId), gte(activity.createdAt, since)),
    columns: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const bucketDate = new Date(since);
    bucketDate.setMonth(bucketDate.getMonth() + i);
    buckets.set(monthKey(bucketDate), 0);
  }
  for (const row of rows) {
    const key = monthKey(row.createdAt);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([month, count]) => ({
    month,
    count,
  }));
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
