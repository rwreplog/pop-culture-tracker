"use client";

import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";
import type { MediaType } from "@/lib/db/schema/media";
import { describeActivity } from "@/lib/media/activity-text";
import { useHydrated } from "@/lib/use-hydrated";

type ActivityType =
  | "added"
  | "started"
  | "completed"
  | "rated"
  | "added_to_list"
  | "updated_progress";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

export function ActivityItem({
  type,
  mediaId,
  title,
  mediaType,
  imageUrl,
  metadata,
  createdAt,
}: {
  type: ActivityType;
  mediaId: string;
  title: string;
  mediaType: MediaType;
  imageUrl: string | null;
  metadata: Record<string, unknown> | null;
  /**
   * ISO 8601 string, not a pre-formatted display string: formatting a time
   * with `toLocaleTimeString` resolves whichever timezone it runs in, so
   * doing it server-side would show the server's timezone rather than the
   * viewer's. See useHydrated — this renders a fixed UTC string until
   * hydrated, then the browser's actual local time.
   */
  createdAt: string;
}) {
  const hydrated = useHydrated();
  const time = new Date(createdAt).toLocaleTimeString(
    hydrated ? undefined : "en-US",
    hydrated ? TIME_FORMAT : { ...TIME_FORMAT, timeZone: "UTC" },
  );

  return (
    <li className="flex items-center gap-3">
      <MediaArtwork
        src={imageUrl}
        title={title}
        className="h-14 w-10 shrink-0"
      />
      <div className="flex flex-col gap-0.5">
        <Link href={`/media/${mediaId}`} className="text-sm hover:underline">
          {describeActivity(type, title, mediaType, metadata)}
        </Link>
        <time dateTime={createdAt} className="text-muted-foreground text-xs">
          {time}
        </time>
      </div>
    </li>
  );
}
