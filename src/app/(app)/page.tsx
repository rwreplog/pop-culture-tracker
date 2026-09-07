import { Compass, Moon } from "lucide-react";
import Link from "next/link";

import { ActivityItem } from "@/components/activity/activity-item";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { MediaCard } from "@/components/media/media-card";
import { buttonVariants } from "@/components/ui/button";
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
          <Link href="/discover" className={buttonVariants()}>
            Go to Discover
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.queue.length > 0 ? (
        <Link
          href="/tonight"
          className="ring-foreground/10 bg-muted/40 hover:bg-muted/70 flex items-center gap-4 rounded-xl p-4 ring-1 transition-colors dark:bg-white/[0.045] dark:ring-white/12 dark:hover:bg-white/[0.07] dark:supports-[backdrop-filter]:backdrop-blur-xl"
        >
          <div className="bg-background dark:from-primary/30 dark:to-accent-2/25 flex size-10 shrink-0 items-center justify-center rounded-full dark:bg-linear-to-br">
            <Moon
              className="text-muted-foreground dark:text-foreground size-5"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">What should I do tonight?</span>
            <span className="text-muted-foreground text-sm">
              Get a pick from your backlog
            </span>
          </div>
        </Link>
      ) : null}

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
                createdAt={item.createdAt.toISOString()}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
