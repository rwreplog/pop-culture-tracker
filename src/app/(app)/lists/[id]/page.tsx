import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteListButton } from "@/components/lists/delete-list-button";
import { ListItemRow } from "@/components/lists/list-item-row";
import { ListVisibilityToggle } from "@/components/lists/list-visibility-toggle";
import { auth } from "@/lib/auth";
import { getListForViewer } from "@/lib/services/lists/queries";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const list = await getListForViewer(session.user.id, id);
  if (!list) notFound();
  const isOwner = list.userId === session.user.id;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {list.name}
            </h1>
            {list.isPublic ? <Badge variant="secondary">Public</Badge> : null}
          </div>
          {list.description ? (
            <p className="text-muted-foreground text-sm">{list.description}</p>
          ) : null}
        </div>
        {isOwner ? (
          <div className="flex shrink-0 items-center gap-2">
            <ListVisibilityToggle listId={list.id} isPublic={list.isPublic} />
            <DeleteListButton listId={list.id} />
          </div>
        ) : null}
      </div>

      {list.items.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">
            {isOwner
              ? "This list is empty. Add items from a media page."
              : "This list is empty."}
          </p>
          {isOwner ? (
            <Link
              href="/discover"
              className={buttonVariants({ variant: "outline" })}
            >
              Go to Discover
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.items.map((item, index) => (
            <ListItemRow
              key={item.id}
              listId={list.id}
              listItemId={item.id}
              mediaId={item.mediaId}
              title={item.media.title}
              mediaType={item.media.mediaType}
              imageUrl={item.media.imageUrl}
              canMoveUp={index > 0}
              canMoveDown={index < list.items.length - 1}
              readOnly={!isOwner}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
