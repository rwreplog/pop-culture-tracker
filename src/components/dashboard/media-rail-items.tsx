import { MediaCard } from "@/components/media/media-card";
import { SeriesGroupCard } from "@/components/series/series-group-card";
import type { Media } from "@/lib/db/schema/media";
import type { libraryStatusEnum } from "@/lib/db/schema/library";
import {
  groupLibraryItemsBySeries,
  type GroupedLibraryItems,
} from "@/lib/services/series/queries";

type LibraryStatus = (typeof libraryStatusEnum.enumValues)[number];

type RailItem = {
  id: string;
  mediaId: string;
  status: LibraryStatus;
  isFavorite: boolean;
  media: Pick<
    Media,
    | "id"
    | "title"
    | "mediaType"
    | "releaseDate"
    | "imageUrl"
    | "seriesId"
    | "seriesPosition"
  >;
};

/**
 * Shared rendering for Home's rails (Continue/Queue/Recently
 * completed/Favorites): groups series members present in this specific
 * rail into one `SeriesGroupCard`, same as the Library grid. Each
 * item's wrapper div carries DashboardSection's rail-vs-grid sizing
 * classes so both card types stay consistent with the surrounding rail.
 */
export function MediaRailItems({
  items,
  seriesTitles,
}: {
  items: RailItem[];
  seriesTitles: Map<string, string>;
}) {
  const grouped: GroupedLibraryItems<RailItem>[] = groupLibraryItemsBySeries(
    items,
    seriesTitles,
  );

  return (
    <>
      {grouped.map((entry) => (
        <div
          key={entry.kind === "series" ? entry.group.seriesId : entry.item.id}
          className="w-32 shrink-0 sm:w-40 md:w-auto md:shrink"
        >
          {entry.kind === "series" ? (
            <SeriesGroupCard
              seriesId={entry.group.seriesId}
              seriesTitle={entry.group.seriesTitle}
              members={entry.group.members}
            />
          ) : (
            <MediaCard
              href={`/media/${entry.item.mediaId}`}
              title={entry.item.media.title}
              mediaType={entry.item.media.mediaType}
              releaseDate={entry.item.media.releaseDate}
              imageUrl={entry.item.media.imageUrl}
              status={entry.item.status}
              isFavorite={entry.item.isFavorite}
              libraryItemId={entry.item.id}
            />
          )}
        </div>
      ))}
    </>
  );
}
