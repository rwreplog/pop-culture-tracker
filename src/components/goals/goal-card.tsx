"use client";

import { useActionState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MediaType } from "@/lib/db/schema/media";
import { mediaTypeLabel } from "@/lib/media/labels";
import { deleteGoalAction } from "@/lib/actions/goals";

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
  const [state, formAction, isPending] = useActionState(
    deleteGoalAction,
    undefined,
  );
  const percent = Math.min(100, Math.round((completed / target) * 100));
  const achieved = completed >= target;

  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
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
        <form action={formAction}>
          <input type="hidden" name="goalId" value={id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            aria-label="Delete goal"
          >
            <X />
          </Button>
        </form>
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
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
