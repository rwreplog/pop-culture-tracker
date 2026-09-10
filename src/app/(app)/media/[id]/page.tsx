import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ActivityItem } from "@/components/activity/activity-item";
import { BackButton } from "@/components/layout/back-button";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { LibraryControls } from "@/components/library/library-controls";
import { ManageMenu } from "@/components/library/manage-menu";
import { AddToListPicker } from "@/components/lists/add-to-list-picker";
import { MediaArtwork } from "@/components/media/media-artwork";
import { MediaCard } from "@/components/media/media-card";
import { MediaDescription } from "@/components/media/media-description";
import { RecommendDialog } from "@/components/media/recommend-dialog";
import { AddToSeriesControl } from "@/components/series/add-to-series-control";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { mediaTypeLabel } from "@/lib/media/labels";
import { getMediaIssueCount, getMediaPageCount } from "@/lib/media/metadata";
import { sanitizeDescription } from "@/lib/media/sanitize-description";
import { getActivityForMedia } from "@/lib/services/activity/queries";
import { getFriends } from "@/lib/services/friendships/queries";
import {
  getLibraryItemForUser,
  getRelatedLibraryItems,
} from "@/lib/services/library/queries";
import { getListsForUser } from "@/lib/services/lists/queries";
import {
  fetchSeriesTitles,
  getSeriesById,
  listSeriesForMediaType,
} from "@/lib/services/series/queries";
import { getUserPreferences } from "@/lib/services/users/queries";
import { presignCustomArtUrl } from "@/lib/storage/custom-art";
import { cn } from "@/lib/utils";

type MediaMetadata = { creator?: string; genres?: string[] };

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, session] = await Promise.all([
    db.query.media.findFirst({ where: eq(media.id, id) }),
    auth(),
  ]);

  if (!item) notFound();

  const metadata = item.metadata as MediaMetadata | null;
  const releaseYear = item.releaseDate ? item.releaseDate.split("-")[0] : null;

  const userId = session?.user?.id;
  const [
    ownedLists,
    activity,
    related,
    friends,
    seriesTitles,
    existingSeries,
    preferences,
  ] = await Promise.all([
    userId ? getListsForUser(userId) : [],
    userId ? getActivityForMedia(userId, item.id) : [],
    userId
      ? getRelatedLibraryItems(
          userId,
          item.id,
          item.mediaType,
          metadata?.genres ?? [],
        )
      : [],
    userId ? getFriends(userId) : [],
    userId && item.seriesId ? fetchSeriesTitles([item.seriesId]) : null,
    userId ? listSeriesForMediaType(item.mediaType) : [],
    userId ? getUserPreferences(userId) : null,
  ]);
  const currentSeries =
    item.seriesId && seriesTitles
      ? {
          id: item.seriesId,
          title: seriesTitles.get(item.seriesId) ?? "Series",
          position: item.seriesPosition,
        }
      : null;

  // In "unified" mode, this item's own library status/rating/notes live
  // on the series parent instead — resolve the library item (and, if
  // this row turns out to itself be a series, its members for the
  // "Currently on" selector) from whichever media row actually holds it.
  const effectiveLibraryMediaId =
    item.seriesId && preferences?.seriesGroupingMode === "unified"
      ? item.seriesId
      : item.id;
  const [libraryItemResult, seriesResult] = await Promise.all([
    userId ? getLibraryItemForUser(userId, effectiveLibraryMediaId) : null,
    userId ? getSeriesById(effectiveLibraryMediaId) : null,
  ]);
  const libraryItem = libraryItemResult ?? null;
  const seriesMembers =
    seriesResult?.members.map((member) => ({
      title: member.title,
      position: member.seriesPosition ?? 0,
    })) ?? [];
  const hasCustomArt = Boolean(libraryItem?.customImageKey);
  const customArtUrl = libraryItem?.customImageKey
    ? await presignCustomArtUrl(libraryItem.customImageKey)
    : null;

  const artUrl = customArtUrl ?? item.imageUrl;
  const heroIconButtonClassName =
    "rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/70 hover:text-white";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 lg:max-w-5xl xl:max-w-6xl">
      <div className="relative -mx-4 -mt-6 h-[440px] w-[calc(100%+2rem)] overflow-hidden md:mx-0 md:mt-0 md:h-[380px] md:w-full md:rounded-3xl">
        <MediaArtwork
          src={artUrl}
          title={item.title}
          className="absolute inset-0 h-full w-full scale-110 rounded-none object-cover opacity-70 blur-2xl"
        />
        <div className="from-background via-background/55 to-background/10 absolute inset-0 bg-gradient-to-t" />
        <BackButton
          fallbackHref="/library"
          iconOnly
          className={cn("absolute top-4 left-4 z-10", heroIconButtonClassName)}
        />
        {userId || libraryItem ? (
          // Mobile only: on desktop these live inline above the description
          // (Recommend) and in the status card (Manage) instead, so they
          // don't collide with a top-right toast.
          <div className="absolute top-4 right-4 z-10 flex gap-2 md:hidden">
            {userId ? (
              <RecommendDialog
                mediaId={item.id}
                friends={friends.map(({ friend }) => friend)}
                iconOnly
                className={heroIconButtonClassName}
              />
            ) : null}
            {libraryItem ? (
              <ManageMenu
                libraryItemId={libraryItem.id}
                mediaId={item.id}
                hasCustomArt={hasCustomArt}
                className={heroIconButtonClassName}
              />
            ) : null}
          </div>
        ) : null}
        <div className="absolute inset-0 flex items-end justify-center pt-10 pb-36 md:pb-28">
          <MediaArtwork
            src={artUrl}
            title={item.title}
            className="aspect-2/3 h-full max-h-56 rounded-2xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] ring-1 ring-white/10 md:max-h-52"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 md:p-6">
          <span className="text-primary text-xs font-semibold tracking-wide uppercase">
            {[mediaTypeLabel(item.mediaType), releaseYear]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {item.title}
          </h1>
          {metadata?.creator ? (
            <p className="text-muted-foreground text-sm">{metadata.creator}</p>
          ) : null}
          {metadata?.genres && metadata.genres.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {metadata.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4 pt-4">
          {userId ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <AddToSeriesControl
                mediaId={item.id}
                mediaType={item.mediaType}
                currentSeries={currentSeries}
                existingSeries={existingSeries.filter(
                  (series) => series.id !== item.id,
                )}
              />
              {/* Desktop only — see the mobile-only hero overlay above. */}
              <div className="hidden md:flex">
                <RecommendDialog
                  mediaId={item.id}
                  friends={friends.map(({ friend }) => friend)}
                />
              </div>
            </div>
          ) : null}

          {/* Below `lg` this is a plain stack, identical to before. At
              `lg` and up it splits into a wider description/left column
              and a sticky "your data" sidebar — scoped to this tab only,
              so Activity/Related and everything below `lg` don't change. */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-start lg:gap-4">
            <div className="flex flex-col gap-4 lg:col-span-2">
              {item.description ? (
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Descriptions come from external provider APIs
                    (Google Books in particular often returns real
                    markup); always sanitized before rendering so a
                    provider response can't inject a script tag or event
                    handler attribute. */}
                    <MediaDescription
                      html={sanitizeDescription(item.description)}
                    />
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-1">
              <LibraryControls
                mediaId={item.id}
                mediaType={item.mediaType}
                libraryItem={libraryItem}
                pageCount={getMediaPageCount(item)}
                issueCount={getMediaIssueCount(item)}
                ownedLists={ownedLists.map((list) => ({
                  id: list.id,
                  name: list.name,
                }))}
                seriesMembers={seriesMembers}
              />

              {ownedLists.length > 0 ? (
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>Lists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddToListPicker
                      mediaId={item.id}
                      ownedLists={ownedLists.map((list) => ({
                        id: list.id,
                        name: list.name,
                      }))}
                    />
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          {activity.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {activity.map((event) => (
                <ActivityItem
                  key={event.id}
                  type={event.type}
                  mediaId={event.mediaId}
                  title={event.media.title}
                  mediaType={event.media.mediaType}
                  imageUrl={event.media.imageUrl}
                  metadata={event.metadata as Record<string, unknown> | null}
                  createdAt={event.createdAt.toISOString()}
                />
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No activity yet for this title.
            </p>
          )}
        </TabsContent>

        <TabsContent value="related" className="pt-4">
          {related.length > 0 ? (
            <DashboardSection>
              {related.map((relatedItem) => (
                <div
                  key={relatedItem.id}
                  className="w-32 shrink-0 sm:w-40 md:w-auto md:shrink"
                >
                  <MediaCard
                    href={`/media/${relatedItem.mediaId}`}
                    title={relatedItem.media.title}
                    mediaType={relatedItem.media.mediaType}
                    releaseDate={relatedItem.media.releaseDate}
                    imageUrl={relatedItem.media.imageUrl}
                    status={relatedItem.status}
                    isFavorite={relatedItem.isFavorite}
                    libraryItemId={relatedItem.id}
                  />
                </div>
              ))}
            </DashboardSection>
          ) : (
            <p className="text-muted-foreground text-sm">
              No related titles in your library yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
