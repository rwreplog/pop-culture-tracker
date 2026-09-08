"use client";

import { Check } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { MediaArtwork } from "@/components/media/media-artwork";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveMediaAction } from "@/lib/actions/media";
import { quickAddToLibraryAction } from "@/lib/actions/library";
import { libraryStatusLabel } from "@/lib/media/labels";
import type { NormalizedSearchResult } from "@/lib/services/media/provider-types";
import { cn } from "@/lib/utils";

const STATUSES = [
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
] as const;

function HiddenResultFields({ result }: { result: NormalizedSearchResult }) {
  return (
    <>
      <input type="hidden" name="provider" value={result.provider} />
      <input type="hidden" name="externalId" value={result.externalId} />
      <input type="hidden" name="mediaType" value={result.mediaType} />
      <input type="hidden" name="title" value={result.title} />
      <input
        type="hidden"
        name="releaseDate"
        value={result.releaseDate ?? ""}
      />
      <input type="hidden" name="imageUrl" value={result.imageUrl ?? ""} />
      <input type="hidden" name="creator" value={result.creator ?? ""} />
      <input
        type="hidden"
        name="description"
        value={result.description ?? ""}
      />
      <input
        type="hidden"
        name="genres"
        value={JSON.stringify(result.genres)}
      />
    </>
  );
}

export function SearchResultCard({
  result,
  alreadyInLibrary = false,
  onAdded,
}: {
  result: NormalizedSearchResult;
  alreadyInLibrary?: boolean;
  onAdded?: (mediaId: string) => void;
}) {
  const [viewState, viewAction, viewPending] = useActionState(
    resolveMediaAction,
    undefined,
  );
  const [addState, addAction, addPending] = useActionState(
    quickAddToLibraryAction,
    undefined,
  );

  const [justAdded, setJustAdded] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !addPending && addState && !("error" in addState)) {
      setJustAdded(true);
      onAdded?.(addState.mediaId);
    }
    wasPending.current = addPending;
  }, [addPending, addState, onAdded]);

  const added = alreadyInLibrary || justAdded;

  return (
    <div className="flex h-full flex-col gap-2">
      <form action={viewAction}>
        <HiddenResultFields result={result} />
        <button
          type="submit"
          disabled={viewPending}
          className="focus-visible:ring-ring group flex w-full flex-col gap-2 rounded-lg text-left outline-none focus-visible:ring-2 disabled:opacity-50"
        >
          <div className="overflow-hidden rounded-lg ring-1 ring-black/5 transition-shadow group-hover:shadow-lg group-hover:ring-black/10 dark:ring-white/10 dark:group-hover:ring-white/15">
            <MediaArtwork
              src={result.imageUrl}
              title={result.title}
              className="aspect-2/3 w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
            />
          </div>
          <span className="line-clamp-2 min-h-9 text-sm leading-tight font-medium group-hover:underline">
            {result.title}
          </span>
        </button>
      </form>

      <span className="text-muted-foreground text-xs">
        {result.releaseDate ? result.releaseDate.split("-")[0] : " "}
      </span>

      {added ? (
        <form action={viewAction} className="mt-auto">
          <HiddenResultFields result={result} />
          <button
            type="submit"
            disabled={viewPending}
            title="Open to change status, rating, or notes"
            className={cn(
              "inline-flex h-10 w-fit items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium outline-none",
              "focus-visible:ring-ring/50 bg-green-600/10 text-green-700 hover:bg-green-600/20 focus-visible:ring-3 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/25",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <Check
              className={cn(
                "size-4",
                justAdded &&
                  "motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:spin-in-45 motion-safe:duration-300",
              )}
              aria-hidden="true"
            />
            In library
          </button>
        </form>
      ) : (
        <form
          action={addAction}
          className="mt-auto flex min-w-0 flex-wrap items-center gap-1.5"
        >
          <HiddenResultFields result={result} />
          <label className="sr-only" htmlFor={`status-${result.externalId}`}>
            Status
          </label>
          <Select name="status" defaultValue="want">
            <SelectTrigger
              id={`status-${result.externalId}`}
              className="min-w-0 flex-1"
            >
              <SelectValue>
                {(value: (typeof STATUSES)[number]) =>
                  libraryStatusLabel(value, result.mediaType)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {libraryStatusLabel(status, result.mediaType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={addPending}>
            Add
          </Button>
        </form>
      )}

      {viewState?.error ? (
        <p role="alert" className="text-destructive text-xs">
          {viewState.error}
        </p>
      ) : null}
      {addState && "error" in addState ? (
        <p role="alert" className="text-destructive text-xs">
          {addState.error}
        </p>
      ) : null}
    </div>
  );
}
