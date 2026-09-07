"use client";

import { useActionState, useState } from "react";

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
import { deleteListAction } from "@/lib/actions/lists";

export function DeleteListButton({ listId }: { listId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteListAction,
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" type="button" />}>
        Delete list
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this list?</DialogTitle>
          <DialogDescription>
            This deletes the list itself. Items on it aren&apos;t removed from
            your library. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="listId" value={listId} />
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
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
