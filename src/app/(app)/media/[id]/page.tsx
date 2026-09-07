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

  return (
    <div className="relative mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row">
      <div className="dark:bg-primary/15 pointer-events-none absolute -top-16 -left-24 -z-10 size-72 rounded-full blur-3xl" />
      <div className="ring-foreground/10 shrink-0 self-start overflow-hidden rounded-2xl shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)] ring-1 dark:shadow-[0_24px_48px_-20px_var(--primary)]">
        <MediaArtwork
          src={customArtUrl ?? item.imageUrl}
          title={item.title}
          className="h-72 w-48 shrink-0"
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-primary text-xs font-semibold tracking-wide uppercase">
          {mediaTypeLabel(item.mediaType)}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
        <p className="text-muted-foreground text-sm">
          {[metadata?.creator, releaseYear].filter(Boolean).join(" · ")}
        </p>
        {metadata?.genres && metadata.genres.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {metadata.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        ) : null}
        {item.description ? (
          <p className="text-sm">{item.description}</p>
        ) : null}
        <div className="pt-2">
          <LibraryControls
            mediaId={item.id}
            mediaType={item.mediaType}
            libraryItem={libraryItem}
          />
        </div>
        <div className="pt-2">
          <AddToListPicker
            mediaId={item.id}
            ownedLists={ownedLists.map((list) => ({
              id: list.id,
              name: list.name,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
