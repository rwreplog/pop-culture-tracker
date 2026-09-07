import { ListChecks } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { CreateListDialog } from "@/components/lists/create-list-dialog";
import { ListCard } from "@/components/lists/list-card";
import { auth } from "@/lib/auth";
import { getListsForUser } from "@/lib/services/lists/queries";

export default async function ListsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={ListChecks}
        title="Your lists"
        description="Sign in to see your lists."
      />
    );
  }

  const lists = await getListsForUser(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Your lists</h1>
          <p className="text-muted-foreground text-sm">
            Custom collections to organize the media you care about.
          </p>
        </div>
        <CreateListDialog />
      </div>

      {lists.length === 0 ? (
        <PlaceholderScreen
          icon={ListChecks}
          title="No lists yet"
          description="Create a list to start grouping media together."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
