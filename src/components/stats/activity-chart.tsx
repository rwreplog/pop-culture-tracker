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

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">Activity</h2>
      <div className="flex h-32 items-end gap-2">
        {data.map((bucket) => (
          <div
            key={bucket.month}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div className="bg-muted flex h-24 w-full items-end overflow-hidden rounded-md">
              <div
                className="bg-primary w-full rounded-md transition-[height]"
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
    </section>
  );
}
