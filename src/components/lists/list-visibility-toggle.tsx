"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { setListVisibilityAction } from "@/lib/actions/lists";

export function ListVisibilityToggle({
  listId,
  isPublic,
}: {
  listId: string;
  isPublic: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    setListVisibilityAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="isPublic" value={String(!isPublic)} />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPublic ? "Make private" : "Make public"}
      </Button>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
