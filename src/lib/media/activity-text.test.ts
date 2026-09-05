import { describe, expect, it } from "vitest";

import { describeActivity } from "@/lib/media/activity-text";

describe("describeActivity", () => {
  it("describes added", () => {
    expect(describeActivity("added", "Dune", "movie", null)).toBe(
      "Added Dune to your library",
    );
  });

  it("uses the right in-progress verb per media type", () => {
    expect(describeActivity("started", "Dune", "movie", null)).toBe(
      "Started watching Dune",
    );
    expect(
      describeActivity("started", "Severance", "tv", null),
    ).toBe("Started watching Severance");
    expect(
      describeActivity("started", "Baldur's Gate 3", "game", null),
    ).toBe("Started playing Baldur's Gate 3");
    expect(
      describeActivity("started", "Project Hail Mary", "book", null),
    ).toBe("Started reading Project Hail Mary");
    expect(describeActivity("started", "Saga", "comic", null)).toBe(
      "Started reading Saga",
    );
  });

  it("describes rated with the half-star value from metadata", () => {
    expect(
      describeActivity("rated", "Dune", "movie", { rating: 7 }),
    ).toBe("Rated Dune 3.5 stars");
    expect(
      describeActivity("rated", "Dune", "movie", { rating: 2 }),
    ).toBe("Rated Dune 1 star");
  });

  it("falls back gracefully when rating metadata is missing", () => {
    expect(describeActivity("rated", "Dune", "movie", null)).toBe(
      "Rated Dune",
    );
  });

  it("describes added_to_list and updated_progress", () => {
    expect(
      describeActivity("added_to_list", "Dune", "movie", null),
    ).toBe("Added Dune to a list");
    expect(
      describeActivity("updated_progress", "Severance", "tv", null),
    ).toBe("Updated progress on Severance");
  });
});
