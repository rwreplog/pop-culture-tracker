"use client";

import { Check } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { HiddenResultFields } from "@/components/media/hidden-result-fields";
import { MediaArtwork } from "@/components/media/media-artwork";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { skipSurprisePickAction } from "@/lib/actions/surprise";
import { resolveMediaAction } from "@/lib/actions/media";
import { quickAddToLibraryAction } from "@/lib/actions/library";
import { mediaTypeLabel } from "@/lib/media/labels";
import type { NormalizedSearchResult } from "@/lib/services/media/provider-types";
import { cn } from "@/lib/utils";

export function SurprisePickCard({
  result,
  reason,
}: {
  result: NormalizedSearchResult;
  reason: string;
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
    if (
      wasPending.current &&
      !addPending &&
      addState &&
      !("error" in addState)
    ) {
      setJustAdded(true);
    }
    wasPending.current = addPending;
  }, [addPending, addState]);

  const releaseYear = result.releaseDate?.split("-")[0] ?? null;

  return (
    <Card variant="glass">
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-4">
          <MediaArtwork
            src={result.imageUrl}
            title={result.title}
            className="h-40 w-28 shrink-0"
            priority
          />
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {mediaTypeLabel(result.mediaType)}
              {releaseYear ? ` · ${releaseYear}` : ""}
            </span>
            <form action={viewAction}>
              <HiddenResultFields result={result} />
              <button
                type="submit"
                disabled={viewPending}
                className="text-left font-semibold hover:underline disabled:opacity-50"
              >
                {result.title}
              </button>
            </form>
            {result.genres.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {result.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            ) : null}
            <p className="text-muted-foreground text-sm">{reason}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {justAdded ? (
            <span
              className={cn(
                "inline-flex h-10 w-fit items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium",
                "bg-green-600/10 text-green-700 dark:bg-green-500/15 dark:text-green-400",
              )}
            >
              <Check className="size-4" aria-hidden="true" />
              In library
            </span>
          ) : (
            <form action={addAction}>
              <HiddenResultFields result={result} />
              <input type="hidden" name="status" value="want" />
              <Button type="submit" disabled={addPending}>
                Add to Library
              </Button>
            </form>
          )}
          <form action={skipSurprisePickAction}>
            <input type="hidden" name="provider" value={result.provider} />
            <input type="hidden" name="externalId" value={result.externalId} />
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Show me something else
            </button>
          </form>
        </div>

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
      </CardContent>
    </Card>
  );
}
