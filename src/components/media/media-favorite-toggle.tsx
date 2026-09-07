"use client";

import { Heart } from "lucide-react";
import { useActionState } from "react";

import { toggleFavoriteAction } from "@/lib/actions/library";
import { cn } from "@/lib/utils";

/**
 * Overlay favorite toggle for a MediaCard. Rendered as a sibling of the
 * card's Link (never nested inside it — an interactive control inside an
 * anchor is invalid), absolutely positioned to land in the same spot the
 * static favorite indicator used to occupy.
 */
export function MediaFavoriteToggle({
  libraryItemId,
  isFavorite,
  className,
}: {
  libraryItemId: string;
  isFavorite: boolean;
  className?: string;
}) {
  const [, formAction, isPending] = useActionState(
    toggleFavoriteAction,
    undefined,
  );

  return (
    <form action={formAction} className={cn("absolute", className)}>
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <input type="hidden" name="isFavorite" value={String(!isFavorite)} />
      <button
        type="submit"
        disabled={isPending}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="focus-visible:ring-ring relative flex size-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors outline-none after:absolute after:-inset-1.5 after:content-[''] hover:bg-black/65 focus-visible:ring-2 disabled:opacity-50"
      >
        <Heart
          className="size-4"
          fill={isFavorite ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
