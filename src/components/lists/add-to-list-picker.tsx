"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addItemToListAction } from "@/lib/actions/lists";
import { withActionToast } from "@/lib/action-toast";

export function AddToListPicker({
  mediaId,
  ownedLists,
}: {
  mediaId: string;
  ownedLists: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(addItemToListAction, "Added to list"),
    undefined,
  );

  if (ownedLists.length === 0) return null;

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="mediaId" value={mediaId} />
      <label className="sr-only" htmlFor="add-to-list">
        Add to list
      </label>
      <Select name="listId" defaultValue={ownedLists[0].id}>
        <SelectTrigger id="add-to-list" className="min-w-0 flex-1">
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
      <Button type="submit" variant="outline" disabled={isPending}>
        Add to List
      </Button>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
