import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { LibraryControls } from "@/components/library/library-controls";
import { MediaArtwork } from "@/components/media/media-artwork";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { mediaTypeLabel } from "@/lib/media/labels";
import { getLibraryItemForUser } from "@/lib/services/library/queries";

type MediaMetadata = { creator?: string };

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
    ? (await getLibraryItemForUser(session.user.id, item.id)) ?? null
    : null;

  const metadata = item.metadata as MediaMetadata | null;
  const releaseYear = item.releaseDate
    ? item.releaseDate.split("-")[0]
    : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row">
      <MediaArtwork
        src={item.imageUrl}
        title={item.title}
        className="h-72 w-48 shrink-0"
      />
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {mediaTypeLabel(item.mediaType)}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {item.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {[metadata?.creator, releaseYear].filter(Boolean).join(" · ")}
        </p>
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
      </div>
    </div>
  );
}
