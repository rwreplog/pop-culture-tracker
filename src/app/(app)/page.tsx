import { Compass } from "lucide-react";
import Link from "next/link";

import { ActivityItem } from "@/components/activity/activity-item";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { MediaCard } from "@/components/media/media-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getActivityFeed } from "@/lib/services/activity/queries";
import { getDashboardSections } from "@/lib/services/library/queries";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={Compass}
        title="Welcome to Geekery"
        description="Sign in to see your continue queue, backlog, and recent activity."
      />
    );
  }

  const [sections, recentActivity] = await Promise.all([
    getDashboardSections(session.user.id),
    getActivityFeed(session.user.id, 5),
  ]);

  const isEmpty =
    sections.continueItems.length === 0 &&
    sections.queue.length === 0 &&
    sections.recentlyCompleted.length === 0 &&
    sections.favorites.length === 0 &&
    recentActivity.length === 0;

  if (isEmpty) {
    return (
      <PlaceholderScreen
        icon={Compass}
        title="Welcome to Geekery"
        description="Search Discover to add your first movie, show, game, book, or comic."
        action={
          <Button nativeButton={false} render={<Link href="/discover" />}>
            Go to Discover
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.continueItems.length > 0 ? (
        <DashboardSection title="Continue">
          {sections.continueItems.map((item) => (
            <div key={item.id} className="w-32 shrink-0 sm:w-40">
              <MediaCard
                href={`/media/${item.mediaId}`}
                title={item.media.title}
                mediaType={item.media.mediaType}
                releaseDate={item.media.releaseDate}
                imageUrl={item.media.imageUrl}
                status={item.status}
                isFavorite={item.isFavorite}
              />
            </div>
          ))}
        </DashboardSection>
      ) : null}

      {sections.queue.length > 0 ? (
        <DashboardSection title="Your queue">
          {sections.queue.map((item) => (
            <div key={item.id} className="w-32 shrink-0 sm:w-40">
              <MediaCard
                href={`/media/${item.mediaId}`}
                title={item.media.title}
                mediaType={item.media.mediaType}
                releaseDate={item.media.releaseDate}
                imageUrl={item.media.imageUrl}
                status={item.status}
                isFavorite={item.isFavorite}
              />
            </div>
          ))}
        </DashboardSection>
      ) : null}

      {sections.recentlyCompleted.length > 0 ? (
        <DashboardSection title="Recently completed">
          {sections.recentlyCompleted.map((item) => (
            <div key={item.id} className="w-32 shrink-0 sm:w-40">
              <MediaCard
                href={`/media/${item.mediaId}`}
                title={item.media.title}
                mediaType={item.media.mediaType}
                releaseDate={item.media.releaseDate}
                imageUrl={item.media.imageUrl}
                status={item.status}
                isFavorite={item.isFavorite}
              />
            </div>
          ))}
        </DashboardSection>
      ) : null}

      {sections.favorites.length > 0 ? (
        <DashboardSection title="Favorites">
          {sections.favorites.map((item) => (
            <div key={item.id} className="w-32 shrink-0 sm:w-40">
              <MediaCard
                href={`/media/${item.mediaId}`}
                title={item.media.title}
                mediaType={item.media.mediaType}
                releaseDate={item.media.releaseDate}
                imageUrl={item.media.imageUrl}
                status={item.status}
                isFavorite={item.isFavorite}
              />
            </div>
          ))}
        </DashboardSection>
      ) : null}

      {recentActivity.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Recent activity
            </h2>
            <Link
              href="/activity"
              className="text-primary text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {recentActivity.map((item) => (
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
        </section>
      ) : null}
    </div>
  );
}
