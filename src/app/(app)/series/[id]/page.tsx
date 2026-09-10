import { notFound } from "next/navigation";

import { BackButton } from "@/components/layout/back-button";
import { SeriesMemberRow } from "@/components/series/series-member-row";
import { auth } from "@/lib/auth";
import { getSeriesById } from "@/lib/services/series/queries";

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const result = await getSeriesById(id);
  if (!result) notFound();
  const { series, members } = result;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <BackButton fallbackHref="/library" />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight break-words">
          {series.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {members.length} {members.length === 1 ? "item" : "items"} in this
          series.
        </p>
      </div>

      {members.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing&apos;s been added to this series yet — add items from their
          media page.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {members.map((item, index) => (
            <SeriesMemberRow
              key={item.id}
              seriesId={series.id}
              mediaId={item.id}
              title={item.title}
              mediaType={item.mediaType}
              imageUrl={item.imageUrl}
              position={item.seriesPosition}
              canMoveUp={index > 0}
              canMoveDown={index < members.length - 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
