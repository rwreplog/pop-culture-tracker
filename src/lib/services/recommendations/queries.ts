import type { MediaType } from "@/lib/db/schema/media";
import { rankBacklog } from "@/lib/services/recommendations/scoring";
import { getLibraryItems } from "@/lib/services/library/queries";

/**
 * The user's backlog (status: "want"), ranked by rankBacklog and optionally
 * narrowed to one media type. Fetches the full library (not just the
 * backlog) since ranking derives genre affinity from completed items.
 */
export async function getSmartBacklog(
  userId: string,
  filters: { mediaType?: MediaType } = {},
) {
  const items = await getLibraryItems(userId);
  const ranked = rankBacklog(items);

  if (!filters.mediaType) return ranked;
  return ranked.filter((item) => item.media.mediaType === filters.mediaType);
}
