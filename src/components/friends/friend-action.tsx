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
import {
  removeFriendshipAction,
  respondFriendRequestAction,
  sendFriendRequestAction,
} from "@/lib/actions/friendships";
import { withActionToast } from "@/lib/action-toast";
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
        successMessage="Request canceled"
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
      successMessage="Friend removed"
      confirm
    />
  );
}

function SendRequestForm({ targetHandle }: { targetHandle: string }) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(sendFriendRequestAction, "Friend request sent"),
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
    withActionToast(respondFriendRequestAction, (_prevState, formData) =>
      formData.get("accept") === "true"
        ? "Friend request accepted"
        : "Request declined",
    ),
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
  successMessage,
  confirm = false,
}: {
  friendshipId: string;
  label: string;
  cancelLabel: string;
  successMessage: string;
  confirm?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    withActionToast(removeFriendshipAction, successMessage),
    undefined,
  );

  const form = (
    <form action={formAction}>
      <input type="hidden" name="friendshipId" value={friendshipId} />
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {cancelLabel}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{label}</span>
        {confirm ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" type="button" />}>
              {cancelLabel}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove this friend?</DialogTitle>
                <DialogDescription>
                  You&apos;ll need to send a new request to become friends
                  again.
                </DialogDescription>
              </DialogHeader>
              {form}
            </DialogContent>
          </Dialog>
        ) : (
          <form action={formAction}>
            <input type="hidden" name="friendshipId" value={friendshipId} />
            <Button type="submit" variant="outline" disabled={isPending}>
              {cancelLabel}
            </Button>
          </form>
        )}
      </div>
      {!confirm && state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
