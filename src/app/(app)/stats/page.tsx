import { BarChart3 } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { ActivityChart } from "@/components/stats/activity-chart";
import { AnnualSummaryCard } from "@/components/stats/annual-summary-card";
import { CountBarList } from "@/components/stats/count-bar-list";
import { StatsOverviewCards } from "@/components/stats/stats-overview-cards";
import { auth } from "@/lib/auth";
import {
  getActivityChartData,
  getInsights,
} from "@/lib/services/insights/queries";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={BarChart3}
        title="Stats"
        description="Sign in to see insights about your entertainment habits."
      />
    );
  }

  const [insights, activityChart] = await Promise.all([
    getInsights(session.user.id),
    getActivityChartData(session.user.id),
  ]);

  if (insights.overview.totalItems === 0) {
    return (
      <PlaceholderScreen
        icon={BarChart3}
        title="No stats yet"
        description="Add items to your library to start seeing insights about your habits."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <StatsOverviewCards overview={insights.overview} />

      <ActivityChart data={activityChart} />

      {insights.genreBreakdown.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Top genres</h2>
          <CountBarList entries={insights.genreBreakdown} />
        </section>
      ) : null}

      {insights.topCreators.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Top creators</h2>
          <CountBarList entries={insights.topCreators} />
        </section>
      ) : null}

      <AnnualSummaryCard summary={insights.annualSummary} />
    </div>
  );
}
