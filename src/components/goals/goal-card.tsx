"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MediaType } from "@/lib/db/schema/media";
import { mediaTypeLabel } from "@/lib/media/labels";
import { deleteGoalAction } from "@/lib/actions/goals";
import { withActionToast } from "@/lib/action-toast";

function goalLabel(mediaType: MediaType | null, genre: string | null): string {
  if (mediaType && genre) return `${genre} ${mediaTypeLabel(mediaType)}s`;
  if (mediaType) return `${mediaTypeLabel(mediaType)}s`;
  if (genre) return `${genre} titles`;
  return "items";
}

export function GoalCard({
  id,
  year,
  target,
  completed,
  mediaType,
  genre,
}: {
  id: string;
  year: number;
  target: number;
  completed: number;
  mediaType: MediaType | null;
  genre: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    withActionToast(deleteGoalAction, "Goal deleted"),
    undefined,
  );
  const percent = Math.min(100, Math.round((completed / target) * 100));
  const achieved = completed >= target;

  return (
    <Card variant="glass">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">
              {target} {goalLabel(mediaType, genre)} in {year}
            </span>
            <span className="text-muted-foreground text-xs">
              {completed} of {target} completed
              {achieved ? " — achieved!" : ""}
            </span>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  aria-label="Delete goal"
                />
              }
            >
              <X />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this goal?</DialogTitle>
                <DialogDescription>
                  This removes the goal and its progress tracking. Titles
                  you&apos;ve already completed aren&apos;t affected.
                </DialogDescription>
              </DialogHeader>
              <form action={formAction}>
                <input type="hidden" name="goalId" value={id} />
                {state?.error ? (
                  <p role="alert" className="text-destructive text-sm">
                    {state.error}
                  </p>
                ) : null}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div
          className="bg-muted h-2 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={achieved ? "bg-primary h-full" : "bg-primary/70 h-full"}
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
