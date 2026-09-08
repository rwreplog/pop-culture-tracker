import { Sparkles } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

import { BackButton } from "@/components/layout/back-button";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { SurprisePickCard } from "@/components/media/surprise-pick-card";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import type { MediaType } from "@/lib/db/schema/media";
import { mediaTypeLabel } from "@/lib/media/labels";
import {
  SURPRISE_MEDIA_TYPES,
  getSurprisePick,
} from "@/lib/services/recommendations/external";
import {
  SURPRISE_SKIP_COOKIE_NAME,
  getSkippedIds,
} from "@/lib/services/recommendations/skip-memory";
import { cn } from "@/lib/utils";

function buildHref(type: MediaType): string {
  return `/surprise?type=${type}`;
}

export default async function SurprisePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={Sparkles}
        title="Surprise me"
        description="Sign in to get a pick from outside your library."
      />
    );
  }

  const mediaType = SURPRISE_MEDIA_TYPES.includes(type as MediaType)
    ? (type as MediaType)
    : "movie";

  const cookieStore = await cookies();
  const skippedKeys = getSkippedIds(
    cookieStore.get(SURPRISE_SKIP_COOKIE_NAME)?.value,
  );
  const pick = await getSurprisePick(session.user.id, mediaType, skippedKeys);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <BackButton fallbackHref="/profile" />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Surprise me</h1>
        <p className="text-muted-foreground text-sm">
          Something new, guessed from what you already love.
        </p>
      </div>

      <nav aria-label="Media type" className="flex flex-wrap gap-1">
        {SURPRISE_MEDIA_TYPES.map((value) => (
          <Link
            key={value}
            href={buildHref(value)}
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

      {pick ? (
        <SurprisePickCard result={pick.result} reason={pick.reason} />
      ) : (
        <PlaceholderScreen
          icon={Sparkles}
          title="Nothing to suggest right now"
          description="We couldn't find something new to recommend — try a different type, or search Discover directly."
          action={
            <Link href="/discover" className={buttonVariants()}>
              Go to Discover
            </Link>
          }
        />
      )}
    </div>
  );
}
