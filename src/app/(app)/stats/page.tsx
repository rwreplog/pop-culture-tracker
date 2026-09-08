import { BarChart3 } from "lucide-react";
import Link from "next/link";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { ActivityChart } from "@/components/stats/activity-chart";
import { AnnualSummaryCard } from "@/components/stats/annual-summary-card";
import { CountBarList } from "@/components/stats/count-bar-list";
import { StatsOverviewCards } from "@/components/stats/stats-overview-cards";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        action={
          <Link href="/discover" className={buttonVariants()}>
            Go to Discover
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <StatsOverviewCards overview={insights.overview} />

      <ActivityChart data={activityChart} />

      {insights.genreBreakdown.length > 0 ? (
        <Card variant="glass">
          <CardHeader>
            <CardTitle
              as="h2"
              className="text-base font-semibold tracking-tight"
            >
              Top genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CountBarList entries={insights.genreBreakdown} />
          </CardContent>
        </Card>
      ) : null}

      {insights.topCreators.length > 0 ? (
        <Card variant="glass">
          <CardHeader>
            <CardTitle
              as="h2"
              className="text-base font-semibold tracking-tight"
            >
              Top creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CountBarList entries={insights.topCreators} />
          </CardContent>
        </Card>
      ) : null}

      <AnnualSummaryCard summary={insights.annualSummary} />
    </div>
  );
}
