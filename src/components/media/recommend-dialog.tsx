"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { recommendMediaAction } from "@/lib/actions/recommendations";
import { withActionToast } from "@/lib/action-toast";

type Friend = { id: string; name: string | null; handle: string | null };

export function RecommendDialog({
  mediaId,
  friends,
  iconOnly = false,
  className,
}: {
  mediaId: string;
  friends: Friend[];
  /** Renders as an unlabeled icon button — for floating over a hero image, say. */
  iconOnly?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    withActionToast(recommendMediaAction, "Recommendation sent"),
    undefined,
  );
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      setOpen(false);
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            type="button"
            size={iconOnly ? "icon" : undefined}
            aria-label={iconOnly ? "Recommend" : undefined}
            className={className}
          />
        }
      >
        <Send
          className="size-4"
          data-icon={iconOnly ? undefined : "inline-start"}
          aria-hidden="true"
        />
        {iconOnly ? null : "Recommend"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recommend to a friend</DialogTitle>
          <DialogDescription>
            {friends.length > 0
              ? "They'll get a notification pointing to this title."
              : "Add friends to recommend titles to them."}
          </DialogDescription>
        </DialogHeader>
        {friends.length === 0 ? (
          <DialogFooter>
            <Link
              href="/friends"
              className={buttonVariants({ variant: "outline" })}
            >
              Go to Friends
            </Link>
          </DialogFooter>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="mediaId" value={mediaId} />
            <label className="sr-only" htmlFor="recommend-friend-select">
              Friend
            </label>
            <Select name="recipientId" defaultValue={friends[0].id}>
              <SelectTrigger id="recommend-friend-select">
                <SelectValue>
                  {(value: string) => {
                    const friend = friends.find((f) => f.id === value);
                    return friend?.name ?? friend?.handle ?? "Choose a friend";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {friends.map((friend) => (
                  <SelectItem key={friend.id} value={friend.id}>
                    {friend.name ?? friend.handle ?? "Friend"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="sr-only" htmlFor="recommend-note">
              Note
            </label>
            <Textarea
              id="recommend-note"
              name="note"
              placeholder="Add a note (optional)"
              rows={3}
            />
            {state?.error ? (
              <p role="alert" className="text-destructive text-sm">
                {state.error}
              </p>
            ) : null}
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                Send
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
