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
import { removeItemFromListAction } from "@/lib/actions/lists";
import { withActionToast } from "@/lib/action-toast";

export function RemoveListItemButton({
  listId,
  listItemId,
}: {
  listId: string;
  listItemId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    withActionToast(removeItemFromListAction, "Removed from list"),
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
            aria-label="Remove from list"
          />
        }
      >
        <X className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove from list?</DialogTitle>
          <DialogDescription>
            This only removes it from this list — it stays in your library.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="listId" value={listId} />
          <input type="hidden" name="listItemId" value={listItemId} />
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
