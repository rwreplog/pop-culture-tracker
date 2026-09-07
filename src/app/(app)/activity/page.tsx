import { History } from "lucide-react";
import Link from "next/link";

import { ActivityFeed } from "@/components/activity/activity-feed";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getActivityFeed } from "@/lib/services/activity/queries";

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
          <Link href="/discover" className={buttonVariants()}>
            Go to Discover
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Activity</h1>
        <p className="text-muted-foreground text-sm">
          A history of what you&apos;ve added, started, completed, and rated.
        </p>
      </div>

      <ActivityFeed
        items={feed.map((item) => ({
          id: item.id,
          type: item.type,
          mediaId: item.mediaId,
          title: item.media.title,
          mediaType: item.media.mediaType,
          imageUrl: item.media.imageUrl,
          metadata: item.metadata as Record<string, unknown> | null,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
