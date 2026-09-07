import Link from "next/link";

import { MediaArtwork } from "@/components/media/media-artwork";

export function ListCard({
  id,
  name,
  description,
  itemCount,
  thumbnails,
}: {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  thumbnails: { title: string; imageUrl: string | null }[];
}) {
  return (
    <Link
      href={`/lists/${id}`}
      className="focus-visible:ring-ring border-border group hover:border-foreground/20 hover:bg-muted/40 flex flex-col gap-3 rounded-2xl border p-4 transition-colors outline-none focus-visible:ring-2 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:supports-[backdrop-filter]:backdrop-blur-xl"
    >
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, index) => {
          const thumbnail = thumbnails[index];
          return (
            <MediaArtwork
              key={index}
              src={thumbnail?.imageUrl ?? null}
              title={thumbnail?.title ?? ""}
              className="aspect-2/3 w-full"
            />
          );
        })}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-medium group-hover:underline">{name}</span>
        {description ? (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {description}
          </p>
        ) : null}
        <span className="text-muted-foreground text-xs">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
    </Link>
  );
}
