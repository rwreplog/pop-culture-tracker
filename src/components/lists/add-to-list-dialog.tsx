"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addItemToListAction } from "@/lib/actions/lists";
import { withActionToast } from "@/lib/action-toast";

/** Prompts to add a title to one of the user's lists, shown right after it's added to the library. */
export function AddToListDialog({
  mediaId,
  ownedLists,
  open,
  onOpenChange,
}: {
  mediaId: string;
  ownedLists: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(addItemToListAction, "Added to list"),
    undefined,
  );
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      onOpenChange(false);
    }
    wasPending.current = isPending;
  }, [isPending, state, onOpenChange]);

  if (ownedLists.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to a list?</DialogTitle>
          <DialogDescription>
            You can add this to one of your lists now, or skip and do it
            later.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="mediaId" value={mediaId} />
          <label className="sr-only" htmlFor="add-to-list-dialog-select">
            List
          </label>
          <Select name="listId" defaultValue={ownedLists[0].id}>
            <SelectTrigger id="add-to-list-dialog-select">
              <SelectValue>
                {(value: string) =>
                  ownedLists.find((list) => list.id === value)?.name
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ownedLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Skip
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              Add to List
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
