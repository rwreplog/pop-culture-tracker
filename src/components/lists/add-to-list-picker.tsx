"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { addItemToListAction } from "@/lib/actions/lists";

export function AddToListPicker({
  mediaId,
  ownedLists,
}: {
  mediaId: string;
  ownedLists: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    addItemToListAction,
    undefined,
  );

  if (ownedLists.length === 0) return null;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="mediaId" value={mediaId} />
      <label className="sr-only" htmlFor="add-to-list">
        Add to list
      </label>
      <select
        id="add-to-list"
        name="listId"
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
      >
        {ownedLists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>
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
