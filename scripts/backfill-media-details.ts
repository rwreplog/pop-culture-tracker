/**
 * One-off backfill: re-fetches every media row from its source provider and
 * updates title/image/description plus pageCount/issueCount, so items added
 * before that data existed (or before a series added more issues) pick up
 * current values. Safe to re-run.
 *
 * Usage:
 *   npm run backfill:media-details
 *   npm run backfill:media-details -- --type=book,comic
 */
import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { media, type MediaType } from "@/lib/db/schema";
import { refreshMediaDetails } from "@/lib/services/media/refresh";

const DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseTypeFilter(): MediaType[] | undefined {
  const arg = process.argv.find((value) => value.startsWith("--type="));
  if (!arg) return undefined;
  return arg.slice("--type=".length).split(",") as MediaType[];
}

async function main() {
  const typeFilter = parseTypeFilter();
  const rows = await db.query.media.findMany({
    where: typeFilter ? inArray(media.mediaType, typeFilter) : undefined,
  });

  console.log(`Refreshing ${rows.length} media row(s)...`);

  let updated = 0;
  let failed = 0;

  for (const row of rows) {
    const result = await refreshMediaDetails(row.id);
    if (result.success) {
      updated += 1;
      console.log(`  ok    ${row.mediaType} "${row.title}"`);
    } else {
      failed += 1;
      console.warn(`  fail  ${row.mediaType} "${row.title}": ${result.error}`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`Done. ${updated} updated, ${failed} failed.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
