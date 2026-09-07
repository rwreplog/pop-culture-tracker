import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsOverview } from "@/lib/services/insights/queries";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm" variant="glass">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function StatsOverviewCards({ overview }: { overview: StatsOverview }) {
  const stats = [
    { label: "In library", value: String(overview.totalItems) },
    { label: "Completed", value: String(overview.byStatus.completed) },
    { label: "In progress", value: String(overview.byStatus.in_progress) },
    {
      label: "Avg rating",
      value:
        overview.averageRating != null
          ? `${(overview.averageRating / 2).toFixed(1)}★`
          : "—",
    },
    { label: "Favorites", value: String(overview.favoritesCount) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
