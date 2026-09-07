"use client";

import { ActivityItem } from "@/components/activity/activity-item";
import type { MediaType } from "@/lib/db/schema/media";
import { useHydrated } from "@/lib/use-hydrated";

type ActivityType =
  | "added"
  | "started"
  | "completed"
  | "rated"
  | "added_to_list"
  | "updated_progress";

export type FeedItem = {
  id: string;
  type: ActivityType;
  mediaId: string;
  title: string;
  mediaType: MediaType;
  imageUrl: string | null;
  metadata: Record<string, unknown> | null;
  /** ISO 8601 string. */
  createdAt: string;
};

function dayLabel(date: Date, now: Date): string {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildGroups(items: FeedItem[], now: Date | null) {
  const groups: { label: string; items: FeedItem[] }[] = [];
  for (const item of items) {
    const label = now
      ? dayLabel(new Date(item.createdAt), now)
      : "Recent activity";
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.label === label) {
      lastGroup.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }
  return groups;
}

/**
 * Groups activity by day ("Today", "Yesterday", or a weekday) relative to
 * the viewer's own calendar day. That grouping only makes sense computed
 * against the viewer's local time, which the server can't know — so
 * (see useHydrated) everything renders under one neutral group until
 * hydrated, then re-groups correctly using the browser's actual clock.
 */
export function ActivityFeed({ items }: { items: FeedItem[] }) {
  const hydrated = useHydrated();
  const groups = buildGroups(items, hydrated ? new Date() : null);

  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-sm font-medium">
            {group.label}
          </h2>
          <ul className="flex flex-col gap-3">
            {group.items.map((item) => (
              <ActivityItem
                key={item.id}
                type={item.type}
                mediaId={item.mediaId}
                title={item.title}
                mediaType={item.mediaType}
                imageUrl={item.imageUrl}
                metadata={item.metadata}
                createdAt={item.createdAt}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
