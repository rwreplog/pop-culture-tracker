import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ListItemRow } from "@/components/lists/list-item-row";
import { auth } from "@/lib/auth";
import { deleteListAction } from "@/lib/actions/lists";
import { getListForUser } from "@/lib/services/lists/queries";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const list = await getListForUser(session.user.id, id);
  if (!list) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">{list.name}</h1>
          {list.description ? (
            <p className="text-muted-foreground text-sm">{list.description}</p>
          ) : null}
        </div>
        <form
          action={async (formData: FormData) => {
            "use server";
            await deleteListAction(undefined, formData);
          }}
        >
          <input type="hidden" name="listId" value={list.id} />
          <Button type="submit" variant="outline">
            Delete list
          </Button>
        </form>
      </div>

      {list.items.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">
            This list is empty. Add items from a media page.
          </p>
          <Button variant="outline" render={<Link href="/discover" />}>
            Go to Discover
          </Button>
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
            />
          ))}
        </ul>
      )}
    </div>
  );
}
