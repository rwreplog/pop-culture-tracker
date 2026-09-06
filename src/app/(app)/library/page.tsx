import { Library } from "lucide-react";
import Link from "next/link";

import { LibraryFilters } from "@/components/library/library-filters";
import { MediaCard } from "@/components/media/media-card";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import type { MediaType } from "@/lib/db/schema/media";
import { getLibraryItems } from "@/lib/services/library/queries";

const MEDIA_TYPES = new Set<MediaType>([
  "movie",
  "tv",
  "game",
  "book",
  "comic",
]);
const STATUSES = new Set([
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
]);

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ mediaType?: string; status?: string }>;
}) {
  const { mediaType, status } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={Library}
        title="Your library"
        description="Sign in to see what you're tracking."
      />
    );
  }

  const items = await getLibraryItems(session.user.id, {
    mediaType: MEDIA_TYPES.has(mediaType as MediaType)
      ? (mediaType as MediaType)
      : undefined,
    status: STATUSES.has(status ?? "")
      ? (status as
          "want" | "in_progress" | "completed" | "paused" | "abandoned")
      : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Your library</h1>
        <p className="text-muted-foreground text-sm">
          Everything you&apos;re tracking, in one place.
        </p>
      </div>

      <LibraryFilters mediaType={mediaType} status={status} />

      {items.length === 0 ? (
        <PlaceholderScreen
          icon={Library}
          title="Nothing here yet"
          description="Search Discover to add movies, shows, games, books, and comics to your library."
          action={
            <Link href="/discover" className={buttonVariants()}>
              Go to Discover
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              href={`/media/${item.mediaId}`}
              title={item.media.title}
              mediaType={item.media.mediaType}
              releaseDate={item.media.releaseDate}
              imageUrl={item.media.imageUrl}
              status={item.status}
              isFavorite={item.isFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
