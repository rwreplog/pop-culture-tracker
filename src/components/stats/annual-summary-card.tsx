import Link from "next/link";

import { CountBarList } from "@/components/stats/count-bar-list";
import { MediaArtwork } from "@/components/media/media-artwork";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mediaTypeLabel } from "@/lib/media/labels";
import type { AnnualSummary } from "@/lib/services/insights/queries";

export function AnnualSummaryCard({ summary }: { summary: AnnualSummary }) {
  if (summary.completedCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{summary.year} in review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nothing completed in {summary.year} yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>{summary.year} in review</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm">
          You completed{" "}
          <span className="font-semibold">{summary.completedCount}</span>{" "}
          {summary.completedCount === 1 ? "item" : "items"} this year.
        </p>

        {summary.topGenres.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Top genres
            </h3>
            <CountBarList entries={summary.topGenres} />
          </div>
        ) : null}

        {summary.topRated.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Highest rated
            </h3>
            <ul className="flex flex-col gap-3">
              {summary.topRated.map((item) => (
                <li key={item.libraryItemId}>
                  <Link
                    href={`/media/${item.mediaId}`}
                    className="focus-visible:ring-ring flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2"
                  >
                    <MediaArtwork
                      src={item.imageUrl}
                      title={item.title}
                      className="aspect-2/3 w-10 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium hover:underline">
                        {item.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {mediaTypeLabel(item.mediaType)} ·{" "}
                        {(item.rating / 2).toFixed(1)}★
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
