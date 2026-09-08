import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ActivityItem } from "@/components/activity/activity-item";
import { BackButton } from "@/components/layout/back-button";
import { LibraryControls } from "@/components/library/library-controls";
import { AddToListPicker } from "@/components/lists/add-to-list-picker";
import { MediaArtwork } from "@/components/media/media-artwork";
import { MediaCard } from "@/components/media/media-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { mediaTypeLabel } from "@/lib/media/labels";
import { getActivityForMedia } from "@/lib/services/activity/queries";
import {
  getLibraryItemForUser,
  getRelatedLibraryItems,
} from "@/lib/services/library/queries";
import { getListsForUser } from "@/lib/services/lists/queries";
import { presignCustomArtUrl } from "@/lib/storage/custom-art";

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
  const [libraryItemResult, ownedLists, activity, related] = await Promise.all([
    userId ? getLibraryItemForUser(userId, item.id) : null,
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
  ]);
  const libraryItem = libraryItemResult ?? null;
  const customArtUrl = libraryItem?.customImageKey
    ? await presignCustomArtUrl(libraryItem.customImageKey)
    : null;

  const artUrl = customArtUrl ?? item.imageUrl;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
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
          className="absolute top-4 left-4 z-10 rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/70 hover:text-white"
        />
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
          {item.description ? (
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ) : null}

          <LibraryControls
            mediaId={item.id}
            mediaType={item.mediaType}
            libraryItem={libraryItem}
            ownedLists={ownedLists.map((list) => ({
              id: list.id,
              name: list.name,
            }))}
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
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [&>*]:snap-start">
              {related.map((relatedItem) => (
                <div key={relatedItem.id} className="w-32 shrink-0 sm:w-40">
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
            </div>
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
