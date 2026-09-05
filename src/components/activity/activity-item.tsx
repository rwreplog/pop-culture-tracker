import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";
import type { MediaType } from "@/lib/db/schema/media";
import { describeActivity } from "@/lib/media/activity-text";

type ActivityType =
  | "added"
  | "started"
  | "completed"
  | "rated"
  | "added_to_list"
  | "updated_progress";

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
  createdAt: Date;
}) {
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
        <time
          dateTime={createdAt.toISOString()}
          className="text-muted-foreground text-xs"
        >
          {createdAt.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </time>
      </div>
    </li>
  );
}
