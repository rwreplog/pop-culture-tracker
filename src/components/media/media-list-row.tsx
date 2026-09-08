import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";
import { MediaFavoriteToggle } from "@/components/media/media-favorite-toggle";
import { Badge } from "@/components/ui/badge";
import type { libraryStatusEnum } from "@/lib/db/schema/library";
import type { MediaType } from "@/lib/db/schema/media";
import { libraryStatusLabel, mediaTypeLabel } from "@/lib/media/labels";

type LibraryStatus = (typeof libraryStatusEnum.enumValues)[number];

/** Compact horizontal row for Library's list view — an alternative to MediaCard's poster grid. */
export function MediaListRow({
  href,
  title,
  mediaType,
  releaseDate,
  imageUrl,
  status,
  rating,
  isFavorite,
  libraryItemId,
}: {
  href: string;
  title: string;
  mediaType: MediaType;
  releaseDate: string | null;
  imageUrl: string | null;
  status?: LibraryStatus;
  rating?: number | null;
  isFavorite?: boolean;
  libraryItemId?: string;
}) {
  const releaseYear = releaseDate ? releaseDate.split("-")[0] : null;

  return (
    <div className="group relative flex items-center gap-3">
      <Link
        href={href}
        className="ring-foreground/10 bg-card focus-visible:ring-ring hover:bg-muted/60 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 ring-1 transition-colors outline-none focus-visible:ring-2 dark:ring-white/10"
      >
        <MediaArtwork
          src={imageUrl}
          title={title}
          className="h-16 w-11 shrink-0 object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium group-hover:underline">
            {title}
          </span>
          <span className="text-muted-foreground text-xs">
            {[mediaTypeLabel(mediaType), releaseYear]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
        {status ? (
          <Badge variant="secondary" className="shrink-0">
            {libraryStatusLabel(status, mediaType)}
          </Badge>
        ) : null}
        {rating ? (
          <span className="text-muted-foreground w-10 shrink-0 text-right text-xs tabular-nums">
            {rating / 2} ★
          </span>
        ) : null}
      </Link>
      {libraryItemId ? (
        <MediaFavoriteToggle
          libraryItemId={libraryItemId}
          isFavorite={Boolean(isFavorite)}
          className="static shrink-0"
        />
      ) : null}
    </div>
  );
}
