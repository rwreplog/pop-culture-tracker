import { describe, expect, it } from "vitest";

import type { LibraryItem } from "@/lib/db/schema/library";
import type { Media } from "@/lib/db/schema/media";
import {
  buildGenreAffinity,
  rankBacklog,
} from "@/lib/services/recommendations/scoring";

type LibraryItemWithMedia = LibraryItem & { media: Media };

let nextId = 0;

function backlogItem(
  overrides: Partial<LibraryItem> & {
    media: Partial<Media> & { genres?: string[] };
  },
): LibraryItemWithMedia {
  nextId += 1;
  const { media: mediaOverrides, ...itemOverrides } = overrides;
  const { genres, ...mediaFields } = mediaOverrides;

  return {
    id: `item-${nextId}`,
    userId: "user-1",
    mediaId: `media-${nextId}`,
    status: "want",
    rating: null,
    isFavorite: false,
    notes: null,
    progress: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(2024, 0, nextId),
    updatedAt: new Date(2024, 0, nextId),
    ...itemOverrides,
    media: {
      id: `media-${nextId}`,
      mediaType: "movie",
      title: `Item ${nextId}`,
      description: null,
      releaseDate: null,
      imageUrl: null,
      metadata: genres ? { genres } : null,
      createdAt: new Date(2024, 0, nextId),
      updatedAt: new Date(2024, 0, nextId),
      ...mediaFields,
    } as Media,
  } as LibraryItemWithMedia;
}

describe("rankBacklog mood boost", () => {
  it("ranks a mood-matching item above a non-matching one, mood aside", () => {
    const comedy = backlogItem({ media: { genres: ["Comedy"] } });
    const horror = backlogItem({ media: { genres: ["Horror"] } });

    const ranked = rankBacklog([comedy, horror], { mood: "light" });

    expect(ranked.map((item) => item.id)).toEqual([comedy.id, horror.id]);
    expect(ranked[0].reason).toBe('Fits "Something light"');
  });

  it("lets a mood match outrank an older, unmatched item", () => {
    const older = backlogItem({
      media: { genres: ["Drama"] },
      createdAt: new Date(2020, 0, 1),
    });
    const moodMatch = backlogItem({
      media: { genres: ["Horror"] },
      createdAt: new Date(2024, 0, 1),
    });

    const ranked = rankBacklog([older, moodMatch], { mood: "intense" });

    expect(ranked[0].id).toBe(moodMatch.id);
  });

  it("has no effect on ranking or reasons when no mood is given", () => {
    const now = new Date();
    const comedy = backlogItem({
      media: { genres: ["Comedy"] },
      createdAt: now,
    });
    const horror = backlogItem({
      media: { genres: ["Horror"] },
      createdAt: now,
    });

    const ranked = rankBacklog([comedy, horror]);

    expect(ranked.every((item) => item.score === 0)).toBe(true);
    expect(
      ranked.every((item) => item.reason === "Next up in your backlog"),
    ).toBe(true);
  });
});

describe("buildGenreAffinity", () => {
  it("counts genres from favorited or highly-rated completed items", () => {
    const favorited = backlogItem({
      status: "completed",
      isFavorite: true,
      media: { genres: ["Comedy", "Drama"] },
    });
    const highlyRated = backlogItem({
      status: "completed",
      rating: 8,
      media: { genres: ["Comedy"] },
    });

    const affinity = buildGenreAffinity([favorited, highlyRated]);

    expect(affinity.get("Comedy")).toBe(2);
    expect(affinity.get("Drama")).toBe(1);
  });

  it("ignores items that aren't completed, favorited, or highly rated", () => {
    const inProgress = backlogItem({
      status: "in_progress",
      media: { genres: ["Horror"] },
    });
    const lowRated = backlogItem({
      status: "completed",
      rating: 4,
      media: { genres: ["Horror"] },
    });

    const affinity = buildGenreAffinity([inProgress, lowRated]);

    expect(affinity.size).toBe(0);
  });
});
