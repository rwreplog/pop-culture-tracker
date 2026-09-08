"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendFriendRequestAction } from "@/lib/actions/friendships";
import { withActionToast } from "@/lib/action-toast";

export function AddFriendForm() {
  const [state, formAction, isPending] = useActionState(
    withActionToast(sendFriendRequestAction, "Friend request sent"),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Label htmlFor="friend-handle" className="sr-only">
        Handle
      </Label>
      <div className="flex gap-2">
        <Input
          id="friend-handle"
          name="handle"
          placeholder="Their handle, e.g. jane-doe"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
        />
        <Button type="submit" disabled={isPending}>
          Add
        </Button>
      </div>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
