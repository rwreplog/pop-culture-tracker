"use client";

import { useActionState } from "react";

import { MediaArtwork } from "@/components/media/media-artwork";
import { Button } from "@/components/ui/button";
import { resolveMediaAction } from "@/lib/actions/media";
import { quickAddToLibraryAction } from "@/lib/actions/library";
import { libraryStatusLabel } from "@/lib/media/labels";
import type { NormalizedSearchResult } from "@/lib/services/media/provider-types";

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
      <input type="hidden" name="releaseDate" value={result.releaseDate ?? ""} />
      <input type="hidden" name="imageUrl" value={result.imageUrl ?? ""} />
      <input type="hidden" name="creator" value={result.creator ?? ""} />
      <input
        type="hidden"
        name="description"
        value={result.description ?? ""}
      />
    </>
  );
}

export function SearchResultCard({
  result,
}: {
  result: NormalizedSearchResult;
}) {
  const [viewState, viewAction, viewPending] = useActionState(
    resolveMediaAction,
    undefined,
  );
  const [addState, addAction, addPending] = useActionState(
    quickAddToLibraryAction,
    undefined,
  );

  return (
    <div className="flex flex-col gap-2">
      <form action={viewAction}>
        <HiddenResultFields result={result} />
        <button
          type="submit"
          disabled={viewPending}
          className="focus-visible:ring-ring group flex w-full flex-col gap-2 rounded-lg text-left outline-none focus-visible:ring-2 disabled:opacity-50"
        >
          <MediaArtwork
            src={result.imageUrl}
            title={result.title}
            className="aspect-2/3 w-full"
          />
          <span className="line-clamp-2 text-sm leading-tight font-medium group-hover:underline">
            {result.title}
          </span>
        </button>
      </form>

      <span className="text-muted-foreground text-xs">
        {result.releaseDate ? result.releaseDate.split("-")[0] : null}
      </span>

      <form action={addAction} className="flex items-center gap-1">
        <HiddenResultFields result={result} />
        <label className="sr-only" htmlFor={`status-${result.externalId}`}>
          Status
        </label>
        <select
          id={`status-${result.externalId}`}
          name="status"
          defaultValue="want"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 flex-1 rounded-lg border bg-transparent px-2 py-1 text-xs outline-none focus-visible:ring-3"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {libraryStatusLabel(status, result.mediaType)}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" disabled={addPending}>
          Add
        </Button>
      </form>

      {viewState?.error ? (
        <p role="alert" className="text-destructive text-xs">
          {viewState.error}
        </p>
      ) : null}
      {addState?.error ? (
        <p role="alert" className="text-destructive text-xs">
          {addState.error}
        </p>
      ) : null}
    </div>
  );
}
