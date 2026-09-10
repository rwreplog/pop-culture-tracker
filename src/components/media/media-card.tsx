import { Heart } from "lucide-react";
import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";
import { MediaFavoriteToggle } from "@/components/media/media-favorite-toggle";
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
  libraryItemId,
  reason,
}: {
  href: string;
  title: string;
  mediaType: MediaType;
  releaseDate: string | null;
  imageUrl: string | null;
  status?: LibraryStatus;
  isFavorite?: boolean;
  /** When set, the favorite badge becomes an interactive toggle. */
  libraryItemId?: string;
  /** Short "why this pick" caption, e.g. for a personalized-recommendation rail. */
  reason?: string;
}) {
  return (
    <div className="group relative flex flex-col gap-2">
      <Link
        href={href}
        className="focus-visible:ring-ring flex flex-col gap-2 rounded-2xl outline-none focus-visible:ring-2"
      >
        <div className="ring-foreground/10 relative overflow-hidden rounded-2xl shadow-[0_10px_24px_-16px_rgba(0,0,0,0.5)] ring-1 transition-shadow group-hover:shadow-[0_16px_32px_-14px_color-mix(in_oklch,var(--primary)_40%,transparent)] dark:ring-white/10 dark:group-hover:ring-white/20">
          <MediaArtwork
            src={imageUrl}
            title={title}
            className="aspect-2/3 w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
          />
          <span className="text-foreground absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase backdrop-blur-sm">
            {mediaTypeLabel(mediaType)}
          </span>
          {isFavorite && !libraryItemId ? (
            <Heart
              aria-label="Favorite"
              className="absolute top-2 right-2 size-4 fill-white text-white drop-shadow"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <span className="line-clamp-2 min-h-9 text-sm leading-tight font-medium group-hover:underline">
            {title}
          </span>
          <span className="text-muted-foreground text-xs">
            {releaseDate
              ? releaseDate.split("-")[0]
              : mediaTypeLabel(mediaType)}
          </span>
          {status ? (
            <Badge variant="secondary" className="w-fit">
              {libraryStatusLabel(status, mediaType)}
            </Badge>
          ) : null}
          {reason ? (
            <span className="text-muted-foreground line-clamp-1 text-xs italic">
              {reason}
            </span>
          ) : null}
        </div>
      </Link>
      {libraryItemId ? (
        <MediaFavoriteToggle
          libraryItemId={libraryItemId}
          isFavorite={Boolean(isFavorite)}
          className="top-2 right-2"
        />
      ) : null}
    </div>
  );
}
