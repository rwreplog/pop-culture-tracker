import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";
import { Button } from "@/components/ui/button";
import { RemoveListItemButton } from "@/components/lists/remove-list-item-button";
import { mediaTypeLabel } from "@/lib/media/labels";
import { reorderListItemAction } from "@/lib/actions/lists";
import type { MediaType } from "@/lib/db/schema/media";

export function ListItemRow({
  listId,
  listItemId,
  mediaId,
  title,
  mediaType,
  imageUrl,
  canMoveUp,
  canMoveDown,
  readOnly = false,
}: {
  listId: string;
  listItemId: string;
  mediaId: string;
  title: string;
  mediaType: MediaType;
  imageUrl: string | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
  readOnly?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border p-2">
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

      {readOnly ? null : (
        <>
          <form
            action={async (formData: FormData) => {
              "use server";
              await reorderListItemAction(undefined, formData);
            }}
          >
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="listItemId" value={listItemId} />
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
              await reorderListItemAction(undefined, formData);
            }}
          >
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="listItemId" value={listItemId} />
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
          <RemoveListItemButton listId={listId} listItemId={listItemId} />
        </>
      )}
    </li>
  );
}
