import { Compass, Moon, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { ActivityItem } from "@/components/activity/activity-item";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { MediaRailItems } from "@/components/dashboard/media-rail-items";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { MediaCard } from "@/components/media/media-card";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getActivityFeed } from "@/lib/services/activity/queries";
import { getDashboardSections } from "@/lib/services/library/queries";
import { fetchSeriesTitles } from "@/lib/services/series/queries";
import { cn } from "@/lib/utils";

/**
 * Home page's "what next?" entry points — What should I do tonight? /
 * Surprise me. Stacked full-width below `sm` (a forced 2-up grid squeezed
 * the icon+title+description row into an unreadably narrow column on
 * phones); side by side from `sm` up where there's room for it.
 */
function HomeActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="ring-foreground/10 bg-muted/40 hover:bg-muted/70 active:bg-muted/70 flex min-w-0 touch-manipulation items-center gap-3 rounded-xl p-3.5 ring-1 transition-colors active:scale-[0.98] sm:gap-4 sm:p-4 dark:bg-white/[0.045] dark:ring-white/12 dark:hover:bg-white/[0.07] dark:active:bg-white/[0.07] dark:supports-[backdrop-filter]:backdrop-blur-xl"
    >
      <div className="bg-background dark:from-primary/30 dark:to-accent-2/25 flex size-10 shrink-0 items-center justify-center rounded-full dark:bg-linear-to-br">
        <Icon
          className="text-muted-foreground dark:text-foreground size-5"
          aria-hidden="true"
        />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="font-semibold">{title}</span>
        <span className="text-muted-foreground text-sm">{description}</span>
      </div>
    </Link>
  );
}

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

  // One batched lookup covering every rail below (excluding "For you",
  // whose recommendation "reason" caption doesn't fit the grouped card).
  const seriesIds = [
    ...new Set(
      [
        ...sections.continueItems,
        ...sections.queue,
        ...sections.recentlyCompleted,
        ...sections.favorites,
      ]
        .map((item) => item.media.seriesId)
        .filter((id): id is string => id != null),
    ),
  ];
  const seriesTitles = await fetchSeriesTitles(seriesIds);

  const isEmpty =
    sections.continueItems.length === 0 &&
    sections.queue.length === 0 &&
    sections.recentlyCompleted.length === 0 &&
    sections.favorites.length === 0 &&
    sections.discovery.length === 0 &&
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
      <div
        className={cn(
          "grid grid-cols-1 gap-3",
          sections.queue.length > 0 && "sm:grid-cols-2",
        )}
      >
        {sections.queue.length > 0 ? (
          <HomeActionCard
            href="/tonight"
            icon={Moon}
            title="What should I do tonight?"
            description="Get a pick from your backlog"
          />
        ) : null}
        <HomeActionCard
          href="/surprise"
          icon={Sparkles}
          title="Surprise me"
          description="Discover something new"
        />
      </div>

      {sections.continueItems.length > 0 ? (
        <DashboardSection title="Continue">
          <MediaRailItems
            items={sections.continueItems}
            seriesTitles={seriesTitles}
          />
        </DashboardSection>
      ) : null}

      {sections.queue.length > 0 ? (
        <DashboardSection title="Your queue">
          <MediaRailItems items={sections.queue} seriesTitles={seriesTitles} />
        </DashboardSection>
      ) : null}

      {sections.recentlyCompleted.length > 0 ? (
        <DashboardSection title="Recently completed">
          <MediaRailItems
            items={sections.recentlyCompleted}
            seriesTitles={seriesTitles}
          />
        </DashboardSection>
      ) : null}

      {sections.favorites.length > 0 ? (
        <DashboardSection title="Favorites">
          <MediaRailItems
            items={sections.favorites}
            seriesTitles={seriesTitles}
          />
        </DashboardSection>
      ) : null}

      {sections.discovery.length > 0 ? (
        <DashboardSection title="For you">
          {sections.discovery.map((item) => (
            <div
              key={item.id}
              className="w-32 shrink-0 sm:w-40 md:w-auto md:shrink"
            >
              <MediaCard
                href={`/media/${item.mediaId}`}
                title={item.media.title}
                mediaType={item.media.mediaType}
                releaseDate={item.media.releaseDate}
                imageUrl={item.media.imageUrl}
                status={item.status}
                isFavorite={item.isFavorite}
                libraryItemId={item.id}
                reason={item.reason}
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
