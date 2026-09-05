import type { activityTypeEnum } from "@/lib/db/schema/activity";
import type { MediaType } from "@/lib/db/schema/media";

type ActivityType = (typeof activityTypeEnum.enumValues)[number];

function inProgressVerb(mediaType: MediaType): string {
  if (mediaType === "game") return "playing";
  if (mediaType === "book" || mediaType === "comic") return "reading";
  return "watching";
}

/** Human-readable description of one activity row, for the Activity feed and Dashboard. */
export function describeActivity(
  type: ActivityType,
  title: string,
  mediaType: MediaType,
  metadata: Record<string, unknown> | null,
): string {
  switch (type) {
    case "added":
      return `Added ${title} to your library`;
    case "started":
      return `Started ${inProgressVerb(mediaType)} ${title}`;
    case "completed":
      return `Completed ${title}`;
    case "rated": {
      const rating =
        typeof metadata?.rating === "number" ? metadata.rating : null;
      return rating != null
        ? `Rated ${title} ${rating / 2} star${rating === 2 ? "" : "s"}`
        : `Rated ${title}`;
    }
    case "added_to_list":
      return `Added ${title} to a list`;
    case "updated_progress":
      return `Updated progress on ${title}`;
  }
}
