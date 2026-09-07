"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  removeFriendshipAction,
  respondFriendRequestAction,
  sendFriendRequestAction,
} from "@/lib/actions/friendships";
import type { FriendshipStatus } from "@/lib/services/friendships/queries";

export function FriendAction({
  status,
  targetHandle,
}: {
  status: FriendshipStatus;
  targetHandle: string;
}) {
  if (status.state === "none") {
    return <SendRequestForm targetHandle={targetHandle} />;
  }
  if (status.state === "requested_by_you") {
    return (
      <CancelForm
        friendshipId={status.friendshipId}
        label="Request sent"
        cancelLabel="Cancel request"
      />
    );
  }
  if (status.state === "requested_by_them") {
    return <RespondForm friendshipId={status.friendshipId} />;
  }
  return (
    <CancelForm
      friendshipId={status.friendshipId}
      label="Friends"
      cancelLabel="Remove friend"
    />
  );
}

function SendRequestForm({ targetHandle }: { targetHandle: string }) {
  const [state, formAction, isPending] = useActionState(
    sendFriendRequestAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="handle" value={targetHandle} />
      <Button type="submit" disabled={isPending}>
        Add friend
      </Button>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function RespondForm({ friendshipId }: { friendshipId: string }) {
  const [state, formAction, isPending] = useActionState(
    respondFriendRequestAction,
    undefined,
  );

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-2">
        <form action={formAction}>
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <input type="hidden" name="accept" value="true" />
          <Button type="submit" disabled={isPending}>
            Accept
          </Button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <input type="hidden" name="accept" value="false" />
          <Button type="submit" variant="outline" disabled={isPending}>
            Decline
          </Button>
        </form>
      </div>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

function CancelForm({
  friendshipId,
  label,
  cancelLabel,
}: {
  friendshipId: string;
  label: string;
  cancelLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(
    removeFriendshipAction,
    undefined,
  );

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{label}</span>
        <form action={formAction}>
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <Button type="submit" variant="outline" disabled={isPending}>
            {cancelLabel}
          </Button>
        </form>
      </div>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
