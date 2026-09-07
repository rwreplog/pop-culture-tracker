import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyActivity } from "@/lib/services/insights/queries";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthLabel(month: string): string {
  const [, monthNumber] = month.split("-");
  return MONTH_LABELS[Number(monthNumber) - 1];
}

export function ActivityChart({ data }: { data: MonthlyActivity[] }) {
  const max = Math.max(1, ...data.map((bucket) => bucket.count));
  const peakIndex = data.reduce(
    (best, bucket, i) => (bucket.count > data[best].count ? i : best),
    0,
  );

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle as="h2" className="text-base font-semibold tracking-tight">
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end gap-2">
          {data.map((bucket, i) => (
            <div
              key={bucket.month}
              className="relative flex flex-1 flex-col items-center gap-1.5"
            >
              {i === peakIndex && bucket.count > 0 ? (
                <span className="bg-foreground text-background dark:from-primary dark:to-accent-2 dark:text-primary-foreground absolute -top-7 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm dark:bg-linear-to-br">
                  {bucket.count}
                </span>
              ) : null}
              <div className="bg-muted flex h-24 w-full items-end overflow-hidden rounded-md">
                <div
                  className="bg-primary dark:from-primary dark:to-accent-2 w-full rounded-md transition-[height] dark:bg-linear-to-t"
                  style={{ height: `${(bucket.count / max) * 100}%` }}
                  role="img"
                  aria-label={`${bucket.count} activity events`}
                />
              </div>
              <span className="text-muted-foreground text-xs">
                {monthLabel(bucket.month)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
