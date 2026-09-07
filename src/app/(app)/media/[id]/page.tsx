import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { LibraryControls } from "@/components/library/library-controls";
import { AddToListPicker } from "@/components/lists/add-to-list-picker";
import { MediaArtwork } from "@/components/media/media-artwork";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { mediaTypeLabel } from "@/lib/media/labels";
import { getLibraryItemForUser } from "@/lib/services/library/queries";
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

  const libraryItem = session?.user?.id
    ? ((await getLibraryItemForUser(session.user.id, item.id)) ?? null)
    : null;
  const ownedLists = session?.user?.id
    ? await getListsForUser(session.user.id)
    : [];
  const customArtUrl = libraryItem?.customImageKey
    ? await presignCustomArtUrl(libraryItem.customImageKey)
    : null;

  const metadata = item.metadata as MediaMetadata | null;
  const releaseYear = item.releaseDate ? item.releaseDate.split("-")[0] : null;

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
        <div className="absolute inset-0 flex items-end justify-center pt-10 pb-36 md:pb-28">
          <MediaArtwork
            src={artUrl}
            title={item.title}
            className="h-full max-h-56 w-auto rounded-2xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] ring-1 ring-white/10 md:max-h-52"
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
            <p className="text-muted-foreground text-sm">
              {metadata.creator}
            </p>
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
      <div className="flex flex-col gap-4">
        {item.description ? (
          <p className="text-sm">{item.description}</p>
        ) : null}
        <LibraryControls
          mediaId={item.id}
          mediaType={item.mediaType}
          libraryItem={libraryItem}
        />
        <AddToListPicker
          mediaId={item.id}
          ownedLists={ownedLists.map((list) => ({
            id: list.id,
            name: list.name,
          }))}
        />
      </div>
    </div>
  );
}
