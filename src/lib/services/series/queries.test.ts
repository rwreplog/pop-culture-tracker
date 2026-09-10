import { describe, expect, it } from "vitest";

import { groupLibraryItemsBySeries } from "@/lib/services/series/queries";

type Item = {
  id: string;
  media: {
    id: string;
    title: string;
    seriesId: string | null;
    seriesPosition: number | null;
  };
};

function item(
  id: string,
  title: string,
  seriesId: string | null = null,
  seriesPosition: number | null = null,
): Item {
  return { id, media: { id: `media-${id}`, title, seriesId, seriesPosition } };
}

describe("groupLibraryItemsBySeries", () => {
  it("returns everything standalone when nothing has a seriesId", () => {
    const items = [item("1", "Dune"), item("2", "Severance")];

    const result = groupLibraryItemsBySeries(items, new Map());

    expect(result).toEqual([
      { kind: "standalone", item: items[0] },
      { kind: "standalone", item: items[1] },
    ]);
  });

  it("leaves a lone series member standalone — grouping needs 2+ present", () => {
    const items = [item("1", "The Fellowship of the Ring", "series-1", 1)];

    const result = groupLibraryItemsBySeries(items, new Map());

    expect(result).toEqual([{ kind: "standalone", item: items[0] }]);
  });

  it("groups 2+ items sharing a seriesId, ordered by seriesPosition", () => {
    const towers = item("2", "The Two Towers", "series-1", 2);
    const fellowship = item("1", "The Fellowship of the Ring", "series-1", 1);
    const king = item("3", "The Return of the King", "series-1", 3);
    // Fed out of position order to prove the group sorts by seriesPosition,
    // not by input order.
    const items = [towers, fellowship, king];

    const result = groupLibraryItemsBySeries(
      items,
      new Map([["series-1", "The Lord of the Rings"]]),
    );

    expect(result).toEqual([
      {
        kind: "series",
        group: {
          seriesId: "series-1",
          seriesTitle: "The Lord of the Rings",
          members: [fellowship, towers, king],
        },
      },
    ]);
  });

  it("falls back to the first member's title when the series title isn't in the lookup map", () => {
    const a = item("1", "Book One", "series-1", 1);
    const b = item("2", "Book Two", "series-1", 2);

    const result = groupLibraryItemsBySeries([a, b], new Map());

    expect(result).toEqual([
      {
        kind: "series",
        group: {
          seriesId: "series-1",
          seriesTitle: "Book One",
          members: [a, b],
        },
      },
    ]);
  });

  it("groups multiple distinct series independently and keeps standalone items in place", () => {
    const lotr1 = item("1", "Fellowship", "series-lotr", 1);
    const lotr2 = item("2", "Two Towers", "series-lotr", 2);
    const dune = item("3", "Dune");
    const dresden1 = item("4", "Storm Front", "series-dresden", 1);
    const dresden2 = item("5", "Fool Moon", "series-dresden", 2);

    const result = groupLibraryItemsBySeries(
      [lotr1, dune, dresden1, lotr2, dresden2],
      new Map([
        ["series-lotr", "The Lord of the Rings"],
        ["series-dresden", "The Dresden Files"],
      ]),
    );

    expect(result).toEqual([
      {
        kind: "series",
        group: {
          seriesId: "series-lotr",
          seriesTitle: "The Lord of the Rings",
          members: [lotr1, lotr2],
        },
      },
      { kind: "standalone", item: dune },
      {
        kind: "series",
        group: {
          seriesId: "series-dresden",
          seriesTitle: "The Dresden Files",
          members: [dresden1, dresden2],
        },
      },
    ]);
  });
});
