"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Provider artwork comes from arbitrary external hosts (TMDB, IGDB, Open
 * Library, ComicVine, ...), so next/image's remotePatterns allowlist isn't a
 * good fit here — a plain <img> is the pragmatic choice. The service worker
 * (public/sw.js) caches these cross-origin requests itself.
 */
export function MediaArtwork({
  src,
  title,
  className,
  priority = false,
}: {
  src: string | null;
  title: string;
  className?: string;
  /** Marks this as the page's single above-the-fold pick (e.g. Tonight/Surprise) so it loads eagerly instead of lazily. */
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
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
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={cn("rounded-lg object-cover", className)}
    />
  );
}
