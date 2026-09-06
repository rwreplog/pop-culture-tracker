import { History } from "lucide-react";
import Link from "next/link";

import { ActivityItem } from "@/components/activity/activity-item";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getActivityFeed } from "@/lib/services/activity/queries";

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={History}
        title="Activity"
        description="Sign in to see your activity history."
      />
    );
  }

  const feed = await getActivityFeed(session.user.id);

  if (feed.length === 0) {
    return (
      <PlaceholderScreen
        icon={History}
        title="No activity yet"
        description="Adding, rating, and updating media you're tracking will show up here."
        action={
          <Button nativeButton={false} render={<Link href="/discover" />}>
            Go to Discover
          </Button>
        }
      />
    );
  }

  const groups: { label: string; items: typeof feed }[] = [];
  for (const item of feed) {
    const label = dayLabel(item.createdAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.label === label) {
      lastGroup.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Activity</h1>
        <p className="text-muted-foreground text-sm">
          A history of what you&apos;ve added, started, completed, and rated.
        </p>
      </div>

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
                title={item.media.title}
                mediaType={item.media.mediaType}
                imageUrl={item.media.imageUrl}
                metadata={item.metadata as Record<string, unknown> | null}
                createdAt={item.createdAt}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
