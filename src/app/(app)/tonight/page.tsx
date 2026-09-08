import { Moon } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

import { BackButton } from "@/components/layout/back-button";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { MediaArtwork } from "@/components/media/media-artwork";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import type { MediaType } from "@/lib/db/schema/media";
import { skipTonightPickAction } from "@/lib/actions/tonight";
import { updateStatusAction } from "@/lib/actions/library";
import { getMediaGenres } from "@/lib/media/metadata";
import { mediaTypeLabel } from "@/lib/media/labels";
import { getSmartBacklog } from "@/lib/services/recommendations/queries";
import {
  MOODS,
  MOOD_LABELS,
  NO_MOOD,
  getAutoMood,
  isMood,
} from "@/lib/services/recommendations/moods";
import {
  SKIP_COOKIE_NAME,
  getSkippedIds,
} from "@/lib/services/recommendations/skip-memory";
import { cn } from "@/lib/utils";

const MEDIA_TYPES: MediaType[] = ["movie", "tv", "game", "book", "comic"];

function buildHref(params: { type?: MediaType; mood?: string }) {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.mood) search.set("mood", params.mood);
  const query = search.toString();
  return query ? `/tonight?${query}` : "/tonight";
}

export default async function TonightPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; mood?: string }>;
}) {
  const { type, mood: moodParam } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={Moon}
        title="What should I do tonight?"
        description="Sign in to get a pick from your backlog."
      />
    );
  }

  const mediaType = MEDIA_TYPES.includes(type as MediaType)
    ? (type as MediaType)
    : undefined;
  // No `mood` param at all means the user hasn't weighed in yet, so default
  // to a time-of-day guess; `mood=none` ("Any mood") explicitly opts out.
  const mood = isMood(moodParam)
    ? moodParam
    : moodParam === NO_MOOD
      ? undefined
      : getAutoMood(new Date());

  const allCandidates = await getSmartBacklog(session.user.id, {
    mediaType,
    mood,
  });

  const cookieStore = await cookies();
  const skippedIds = getSkippedIds(cookieStore.get(SKIP_COOKIE_NAME)?.value);
  const unskipped = allCandidates.filter((item) => !skippedIds.has(item.id));
  // Fall back to the full list once everything's been recently skipped,
  // rather than showing an empty state the user's backlog doesn't warrant.
  const candidates = unskipped.length > 0 ? unskipped : allCandidates;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <BackButton fallbackHref="/profile" />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          What should I do tonight?
        </h1>
        <p className="text-muted-foreground text-sm">
          A pick from your backlog, based on what you&apos;ve liked before.
        </p>
      </div>

      <nav aria-label="Media type" className="flex flex-wrap gap-1">
        <Link
          href={buildHref({ mood })}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium",
            !mediaType
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          All
        </Link>
        {MEDIA_TYPES.map((value) => (
          <Link
            key={value}
            href={buildHref({ type: value, mood })}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              value === mediaType
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {mediaTypeLabel(value)}
          </Link>
        ))}
      </nav>

      <nav aria-label="Mood" className="flex flex-wrap gap-1">
        <Link
          href={buildHref({ type: mediaType, mood: NO_MOOD })}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm font-medium",
            !mood
              ? "border-primary text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent",
          )}
        >
          Any mood
        </Link>
        {MOODS.map((value) => (
          <Link
            key={value}
            href={buildHref({ type: mediaType, mood: value })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              value === mood
                ? "border-primary text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent",
            )}
          >
            {MOOD_LABELS[value]}
          </Link>
        ))}
      </nav>
      {moodParam === undefined && mood ? (
        <p className="text-muted-foreground -mt-4 text-xs">
          Based on the time, we&apos;re leaning{" "}
          {MOOD_LABELS[mood].toLowerCase()}.
        </p>
      ) : null}

      {candidates.length === 0 ? (
        <PlaceholderScreen
          icon={Moon}
          title="Nothing to suggest yet"
          description={
            mediaType
              ? `Add something to your ${mediaTypeLabel(mediaType).toLowerCase()} backlog to get a pick.`
              : "Add something to your backlog to get a pick."
          }
          action={
            <Link href="/discover" className={buttonVariants()}>
              Go to Discover
            </Link>
          }
        />
      ) : (
        (() => {
          const pick = candidates[0];
          const releaseYear = pick.media.releaseDate?.split("-")[0] ?? null;
          const genres = getMediaGenres(pick.media);

          return (
            <Card variant="glass">
              <CardContent className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <MediaArtwork
                    src={pick.media.imageUrl}
                    title={pick.media.title}
                    className="h-40 w-28 shrink-0"
                  />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      {mediaTypeLabel(pick.media.mediaType)}
                      {releaseYear ? ` · ${releaseYear}` : ""}
                    </span>
                    <Link
                      href={`/media/${pick.mediaId}`}
                      className="font-semibold hover:underline"
                    >
                      {pick.media.title}
                    </Link>
                    {genres.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {genres.slice(0, 3).map((genre) => (
                          <Badge key={genre} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-muted-foreground text-sm">
                      {pick.reason}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await updateStatusAction(undefined, formData);
                    }}
                  >
                    <input type="hidden" name="libraryItemId" value={pick.id} />
                    <input type="hidden" name="status" value="in_progress" />
                    <Button type="submit">Start tonight</Button>
                  </form>
                  <form action={skipTonightPickAction}>
                    <input type="hidden" name="libraryItemId" value={pick.id} />
                    <button
                      type="submit"
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      Show me something else
                    </button>
                  </form>
                  <Link
                    href={`/media/${pick.mediaId}`}
                    className="text-muted-foreground text-sm hover:underline"
                  >
                    View details
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })()
      )}
    </div>
  );
}
