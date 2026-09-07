import { notFound } from "next/navigation";

import { FriendAction } from "@/components/friends/friend-action";
import { ListCard } from "@/components/lists/list-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { getFriendshipStatus } from "@/lib/services/friendships/queries";
import { getPublicListsForUser } from "@/lib/services/lists/queries";
import { getPublicUserByHandle } from "@/lib/services/users/queries";

function initials(name: string | null) {
  return (name ?? "?").charAt(0).toUpperCase();
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const profileUser = await getPublicUserByHandle(handle);
  if (!profileUser) notFound();

  const isSelf = profileUser.id === session.user.id;
  const [lists, friendshipStatus] = await Promise.all([
    getPublicListsForUser(profileUser.id),
    isSelf
      ? Promise.resolve(null)
      : getFriendshipStatus(session.user.id, profileUser.id),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          {profileUser.image ? (
            <AvatarImage src={profileUser.image} alt="" />
          ) : null}
          <AvatarFallback className="text-lg">
            {initials(profileUser.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">
            {profileUser.name ?? profileUser.handle}
          </p>
          <p className="text-muted-foreground truncate text-sm">
            @{profileUser.handle}
          </p>
        </div>
      </div>

      {profileUser.bio ? (
        <p className="text-sm whitespace-pre-wrap">{profileUser.bio}</p>
      ) : null}

      {!isSelf && friendshipStatus ? (
        <FriendAction
          status={friendshipStatus}
          targetHandle={profileUser.handle ?? handle}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Public lists</h2>
        {lists.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {isSelf ? "You haven't" : "They haven't"} made any lists public yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                id={list.id}
                name={list.name}
                description={list.description}
                itemCount={list.items.length}
                thumbnails={list.items.slice(0, 4).map((item) => ({
                  title: item.media.title,
                  imageUrl: item.media.imageUrl,
                }))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
