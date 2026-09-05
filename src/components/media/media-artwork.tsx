import { cn } from "@/lib/utils";

/**
 * Provider artwork comes from arbitrary external hosts (TMDB, RAWG, Open
 * Library, ComicVine, ...), so next/image's remotePatterns allowlist isn't a
 * good fit here — a plain <img> is the pragmatic choice.
 */
export function MediaArtwork({
  src,
  title,
  className,
}: {
  src: string | null;
  title: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground flex items-center justify-center rounded-lg text-xs",
          className,
        )}
      >
        No artwork
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      loading="lazy"
      className={cn("rounded-lg object-cover", className)}
    />
  );
}
