"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  removeFriendshipAction,
  respondFriendRequestAction,
} from "@/lib/actions/friendships";
import { withActionToast } from "@/lib/action-toast";

/** Accept/Decline buttons for an incoming request row on `/friends`. */
export function RespondButtons({ friendshipId }: { friendshipId: string }) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(respondFriendRequestAction, (_prevState, formData) =>
      formData.get("accept") === "true"
        ? "Friend request accepted"
        : "Request declined",
    ),
    undefined,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex shrink-0 gap-2">
        <form action={formAction}>
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <input type="hidden" name="accept" value="true" />
          <Button type="submit" size="sm" disabled={isPending}>
            Accept
          </Button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <input type="hidden" name="accept" value="false" />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isPending}
          >
            Decline
          </Button>
        </form>
      </div>
      {state?.error ? (
        <p role="alert" className="text-destructive text-xs">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

/** Single-button remove-friendship form, shared by the sent-requests "Cancel" and friends-list "Remove" rows on `/friends`. */
export function RemoveFriendshipButton({
  friendshipId,
  label,
  successMessage,
}: {
  friendshipId: string;
  label: string;
  successMessage: string;
}) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(removeFriendshipAction, successMessage),
    undefined,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction} className="shrink-0">
        <input type="hidden" name="friendshipId" value={friendshipId} />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {label}
        </Button>
      </form>
      {state?.error ? (
        <p role="alert" className="text-destructive text-xs">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
