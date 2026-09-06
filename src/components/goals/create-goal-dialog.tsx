"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { createGoalAction } from "@/lib/actions/goals";
import { ANY_MEDIA_TYPE } from "@/lib/schemas/goals";
import { mediaTypeLabel } from "@/lib/media/labels";

const MEDIA_TYPES = ["movie", "tv", "game", "book", "comic"] as const;

export function CreateGoalDialog({ currentYear }: { currentYear: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createGoalAction,
    undefined,
  );
  // createGoalAction doesn't redirect (it stays on /goals), so close the
  // dialog ourselves once a submission finishes without an error.
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) setOpen(false);
    wasPending.current = isPending;
  }, [isPending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add goal</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a goal</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="goal-target">How many</Label>
              <Input
                id="goal-target"
                name="target"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                required
                defaultValue={12}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="goal-year">Year</Label>
              <Input
                id="goal-year"
                name="year"
                type="number"
                inputMode="numeric"
                required
                defaultValue={currentYear}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-media-type">Media type</Label>
            <Select name="mediaType" defaultValue={ANY_MEDIA_TYPE}>
              <SelectTrigger id="goal-media-type">
                <SelectValue>
                  {(value: string) =>
                    value === ANY_MEDIA_TYPE
                      ? "Any type"
                      : mediaTypeLabel(value as (typeof MEDIA_TYPES)[number])
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_MEDIA_TYPE}>Any type</SelectItem>
                {MEDIA_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {mediaTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-genre">Genre (optional)</Label>
            <Input
              id="goal-genre"
              name="genre"
              placeholder="e.g. Science Fiction"
              maxLength={100}
            />
          </div>
          {state?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Add goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
