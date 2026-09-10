"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";

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
import { removeFromSeriesAction } from "@/lib/actions/series";
import { withActionToast } from "@/lib/action-toast";

export function RemoveFromSeriesButton({ mediaId }: { mediaId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    withActionToast(removeFromSeriesAction, "Removed from series"),
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label="Remove from series"
          />
        }
      >
        <X className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove from series?</DialogTitle>
          <DialogDescription>
            This only removes it from the series — it stays in your library.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="mediaId" value={mediaId} />
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
            <Button type="submit" variant="destructive" disabled={isPending}>
              Remove
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
