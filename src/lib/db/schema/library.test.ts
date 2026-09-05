import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { libraryItems, libraryStatusEnum } from "@/lib/db/schema/library";

describe("libraryItems schema", () => {
  it("enforces one library item per user per media", () => {
    const { uniqueConstraints } = getTableConfig(libraryItems);
    const columnNames = uniqueConstraints.flatMap((constraint) =>
      constraint.columns.map((column) => column.name),
    );

    expect(columnNames).toEqual(
      expect.arrayContaining(["user_id", "media_id"]),
    );
  });

  it("defaults new items to the 'want' status", () => {
    const statusColumn = libraryItems.status;
    expect(statusColumn.default).toBe("want");
  });

  it("exposes the canonical status values", () => {
    expect(libraryStatusEnum.enumValues).toEqual([
      "want",
      "in_progress",
      "completed",
      "paused",
      "abandoned",
    ]);
  });
});
