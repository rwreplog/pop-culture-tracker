import { Heart } from "lucide-react";
import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";
import { Badge } from "@/components/ui/badge";
import type { libraryStatusEnum } from "@/lib/db/schema/library";
import type { MediaType } from "@/lib/db/schema/media";
import { libraryStatusLabel, mediaTypeLabel } from "@/lib/media/labels";

type LibraryStatus = (typeof libraryStatusEnum.enumValues)[number];

/**
 * The shared media artwork card used across Library, Discover, and
 * Dashboard. Status is shown as a labeled badge, never color-only, per
 * docs/DESIGN_SYSTEM.md.
 */
export function MediaCard({
  href,
  title,
  mediaType,
  releaseDate,
  imageUrl,
  status,
  isFavorite,
}: {
  href: string;
  title: string;
  mediaType: MediaType;
  releaseDate: string | null;
  imageUrl: string | null;
  status?: LibraryStatus;
  isFavorite?: boolean;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring group flex flex-col gap-2 rounded-lg outline-none focus-visible:ring-2"
    >
      <div className="relative overflow-hidden rounded-lg ring-1 ring-black/5 transition-shadow group-hover:shadow-lg group-hover:ring-black/10 dark:ring-white/10 dark:group-hover:ring-white/15">
        <MediaArtwork
          src={imageUrl}
          title={title}
          className="aspect-2/3 w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
        {isFavorite ? (
          <Heart
            aria-label="Favorite"
            className="absolute top-2 right-2 size-4 fill-white text-white drop-shadow"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <span className="line-clamp-2 text-sm leading-tight font-medium group-hover:underline">
          {title}
        </span>
        <span className="text-muted-foreground text-xs">
          {mediaTypeLabel(mediaType)}
          {releaseDate ? ` · ${releaseDate.split("-")[0]}` : ""}
        </span>
        {status ? (
          <Badge variant="secondary" className="w-fit">
            {libraryStatusLabel(status, mediaType)}
          </Badge>
        ) : null}
      </div>
    </Link>
  );
}
