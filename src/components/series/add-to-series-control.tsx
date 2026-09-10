"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Layers } from "lucide-react";
import Link from "next/link";

import { RemoveFromSeriesButton } from "@/components/series/remove-from-series-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MediaType } from "@/lib/db/schema/media";
import { addToSeriesAction, createSeriesAction } from "@/lib/actions/series";
import { withActionToast } from "@/lib/action-toast";

type ExistingSeries = { id: string; title: string };
type CurrentSeries = { id: string; title: string; position: number | null };

export function AddToSeriesControl({
  mediaId,
  mediaType,
  currentSeries,
  existingSeries,
}: {
  mediaId: string;
  mediaType: MediaType;
  currentSeries: CurrentSeries | null;
  existingSeries: ExistingSeries[];
}) {
  const [open, setOpen] = useState(false);

  const [addState, addAction, isAdding] = useActionState(
    withActionToast(addToSeriesAction, "Added to series"),
    undefined,
  );
  const [createState, createAction, isCreating] = useActionState(
    withActionToast(createSeriesAction, "Series created"),
    undefined,
  );

  const wasAdding = useRef(false);
  useEffect(() => {
    if (wasAdding.current && !isAdding && !addState?.error) setOpen(false);
    wasAdding.current = isAdding;
  }, [isAdding, addState]);

  const wasCreating = useRef(false);
  useEffect(() => {
    if (wasCreating.current && !isCreating && !createState?.error) {
      setOpen(false);
    }
    wasCreating.current = isCreating;
  }, [isCreating, createState]);

  if (currentSeries) {
    return (
      <div className="ring-foreground/10 flex items-center gap-2 rounded-full py-1 pr-1 pl-3 text-sm ring-1">
        <Layers className="text-muted-foreground size-3.5" aria-hidden="true" />
        <Link
          href={`/series/${currentSeries.id}`}
          className="min-w-0 truncate hover:underline"
        >
          {currentSeries.title}
          {currentSeries.position ? ` · #${currentSeries.position}` : ""}
        </Link>
        <RemoveFromSeriesButton mediaId={mediaId} />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" type="button" />}>
        <Layers
          className="size-4"
          data-icon="inline-start"
          aria-hidden="true"
        />
        Add to series
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to a series</DialogTitle>
          <DialogDescription>
            Groups this with other installments — e.g. the other books in a
            trilogy.
          </DialogDescription>
        </DialogHeader>

        {existingSeries.length > 0 ? (
          <form action={addAction} className="flex flex-col gap-3">
            <input type="hidden" name="mediaId" value={mediaId} />
            <Label className="sr-only" htmlFor="existing-series">
              Existing series
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Select name="seriesId" defaultValue={existingSeries[0].id}>
                <SelectTrigger id="existing-series" className="min-w-0 flex-1">
                  <SelectValue>
                    {(value: string) =>
                      existingSeries.find((s) => s.id === value)?.title
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {existingSeries.map((series) => (
                    <SelectItem key={series.id} value={series.id}>
                      {series.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" variant="outline" disabled={isAdding}>
                Add
              </Button>
            </div>
            {addState?.error ? (
              <p role="alert" className="text-destructive text-sm">
                {addState.error}
              </p>
            ) : null}
          </form>
        ) : null}

        <form action={createAction} className="flex flex-col gap-3">
          <input type="hidden" name="mediaId" value={mediaId} />
          <input type="hidden" name="mediaType" value={mediaType} />
          <Label htmlFor="new-series-title">
            {existingSeries.length > 0
              ? "Or create a new series"
              : "Series name"}
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="new-series-title"
              name="title"
              required
              maxLength={100}
              placeholder="e.g. The Lord of the Rings"
              className="min-w-0 flex-1"
            />
            <Button type="submit" disabled={isCreating}>
              Create
            </Button>
          </div>
          {createState?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {createState.error}
            </p>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
