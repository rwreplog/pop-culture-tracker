import { Users } from "lucide-react";
import Link from "next/link";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { AddFriendForm } from "@/components/friends/add-friend-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  removeFriendshipAction,
  respondFriendRequestAction,
} from "@/lib/actions/friendships";
import {
  getFriends,
  getIncomingRequests,
  getOutgoingRequests,
} from "@/lib/services/friendships/queries";

function initials(name: string | null) {
  return (name ?? "?").charAt(0).toUpperCase();
}

function PersonRow({
  handle,
  name,
  image,
  action,
}: {
  handle: string | null;
  name: string | null;
  image: string | null;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <Link
        href={handle ? `/u/${handle}` : "#"}
        className="flex min-w-0 items-center gap-3"
      >
        <Avatar className="size-10">
          {image ? <AvatarImage src={image} alt="" /> : null}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{name ?? handle}</p>
          {handle ? (
            <p className="text-muted-foreground truncate text-xs">@{handle}</p>
          ) : null}
        </div>
      </Link>
      {action}
    </div>
  );
}

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={Users}
        title="Friends"
        description="Sign in to see your friends."
      />
    );
  }

  const [friends, incoming, outgoing] = await Promise.all([
    getFriends(session.user.id),
    getIncomingRequests(session.user.id),
    getOutgoingRequests(session.user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Friends</h1>
        <p className="text-muted-foreground text-sm">
          Find people by their handle and connect.
        </p>
      </div>

      <AddFriendForm />

      {incoming.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Requests</h2>
          {incoming.map((request) => (
            <PersonRow
              key={request.friendshipId}
              handle={request.from.handle}
              name={request.from.name}
              image={request.from.image}
              action={
                <div className="flex shrink-0 gap-2">
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await respondFriendRequestAction(undefined, formData);
                    }}
                  >
                    <input
                      type="hidden"
                      name="friendshipId"
                      value={request.friendshipId}
                    />
                    <input type="hidden" name="accept" value="true" />
                    <Button type="submit" size="sm">
                      Accept
                    </Button>
                  </form>
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await respondFriendRequestAction(undefined, formData);
                    }}
                  >
                    <input
                      type="hidden"
                      name="friendshipId"
                      value={request.friendshipId}
                    />
                    <input type="hidden" name="accept" value="false" />
                    <Button type="submit" variant="outline" size="sm">
                      Decline
                    </Button>
                  </form>
                </div>
              }
            />
          ))}
        </div>
      ) : null}

      {outgoing.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Sent requests</h2>
          {outgoing.map((request) => (
            <PersonRow
              key={request.friendshipId}
              handle={request.to.handle}
              name={request.to.name}
              image={request.to.image}
              action={
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await removeFriendshipAction(undefined, formData);
                  }}
                  className="shrink-0"
                >
                  <input
                    type="hidden"
                    name="friendshipId"
                    value={request.friendshipId}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Cancel
                  </Button>
                </form>
              }
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">
          {friends.length > 0 ? `Friends (${friends.length})` : "Friends"}
        </h2>
        {friends.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No friends yet — add someone by their handle above.
          </p>
        ) : (
          friends.map(({ friendshipId, friend }) => (
            <PersonRow
              key={friendshipId}
              handle={friend.handle}
              name={friend.name}
              image={friend.image}
              action={
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await removeFriendshipAction(undefined, formData);
                  }}
                  className="shrink-0"
                >
                  <input
                    type="hidden"
                    name="friendshipId"
                    value={friendshipId}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Remove
                  </Button>
                </form>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
