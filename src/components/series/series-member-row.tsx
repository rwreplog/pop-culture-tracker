import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";
import { RemoveFromSeriesButton } from "@/components/series/remove-from-series-button";
import { Button } from "@/components/ui/button";
import type { MediaType } from "@/lib/db/schema/media";
import { reorderSeriesMemberAction } from "@/lib/actions/series";
import { mediaTypeLabel } from "@/lib/media/labels";

export function SeriesMemberRow({
  seriesId,
  mediaId,
  title,
  mediaType,
  imageUrl,
  position,
  canMoveUp,
  canMoveDown,
}: {
  seriesId: string;
  mediaId: string;
  title: string;
  mediaType: MediaType;
  imageUrl: string | null;
  position: number | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border p-2">
      <span className="text-muted-foreground w-5 shrink-0 text-center text-sm tabular-nums">
        {position ?? ""}
      </span>
      <MediaArtwork
        src={imageUrl}
        title={title}
        className="h-16 w-11 shrink-0"
      />
      <Link
        href={`/media/${mediaId}`}
        className="min-w-0 flex-1 hover:underline"
      >
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="text-muted-foreground text-xs">
          {mediaTypeLabel(mediaType)}
        </span>
      </Link>

      <form
        action={async (formData: FormData) => {
          "use server";
          await reorderSeriesMemberAction(undefined, formData);
        }}
      >
        <input type="hidden" name="seriesId" value={seriesId} />
        <input type="hidden" name="mediaId" value={mediaId} />
        <input type="hidden" name="direction" value="up" />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={!canMoveUp}
          aria-label="Move up"
        >
          <ChevronUp className="size-4" />
        </Button>
      </form>
      <form
        action={async (formData: FormData) => {
          "use server";
          await reorderSeriesMemberAction(undefined, formData);
        }}
      >
        <input type="hidden" name="seriesId" value={seriesId} />
        <input type="hidden" name="mediaId" value={mediaId} />
        <input type="hidden" name="direction" value="down" />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={!canMoveDown}
          aria-label="Move down"
        >
          <ChevronDown className="size-4" />
        </Button>
      </form>
      <RemoveFromSeriesButton mediaId={mediaId} />
    </li>
  );
}
