import { Layers } from "lucide-react";
import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";
import type { libraryStatusEnum } from "@/lib/db/schema/library";
import type { MediaType } from "@/lib/db/schema/media";
import { completedVerb, mediaTypeLabel } from "@/lib/media/labels";

type LibraryStatus = (typeof libraryStatusEnum.enumValues)[number];

type SeriesMember = {
  status: LibraryStatus;
  media: {
    title: string;
    mediaType: MediaType;
    imageUrl: string | null;
  };
};

/**
 * The grid-card representation of a series — same footprint as MediaCard
 * so it slots into the existing poster grids (Library, Home) without
 * changing their column math. Links to the series detail page rather
 * than expanding inline, since these grids don't have room to reflow.
 */
export function SeriesGroupCard({
  seriesId,
  seriesTitle,
  members,
}: {
  seriesId: string;
  seriesTitle: string;
  members: SeriesMember[];
}) {
  const mediaType = members[0].media.mediaType;
  const completedCount = members.filter(
    (member) => member.status === "completed",
  ).length;

  return (
    <Link
      href={`/series/${seriesId}`}
      className="group focus-visible:ring-ring flex flex-col gap-2 rounded-2xl outline-none focus-visible:ring-2"
    >
      <div className="ring-foreground/10 relative overflow-hidden rounded-2xl shadow-[0_10px_24px_-16px_rgba(0,0,0,0.5)] ring-1 transition-shadow group-hover:shadow-[0_16px_32px_-14px_color-mix(in_oklch,var(--primary)_40%,transparent)] dark:ring-white/10 dark:group-hover:ring-white/20">
        <MediaArtwork
          src={members[0].media.imageUrl}
          title={seriesTitle}
          className="aspect-2/3 w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
        <span className="text-foreground absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase backdrop-blur-sm">
          {mediaTypeLabel(mediaType)}
        </span>
        <span className="text-foreground absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
          <Layers className="size-3" aria-hidden="true" />
          {members.length}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="line-clamp-2 min-h-9 text-sm leading-tight font-medium group-hover:underline">
          {seriesTitle}
        </span>
        <span className="text-muted-foreground text-xs">
          {completedCount} of {members.length} {completedVerb(mediaType)}
        </span>
      </div>
    </Link>
  );
}
