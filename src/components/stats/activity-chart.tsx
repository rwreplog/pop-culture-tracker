"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { chartTooltipContent } from "@/components/stats/chart-tooltip";
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
  const peakIndex = data.reduce(
    (best, bucket, i) => (bucket.count > data[best].count ? i : best),
    0,
  );
  const hasActivity = data[peakIndex]?.count > 0;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle as="h2" className="text-base font-semibold tracking-tight">
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={data}
            margin={{ top: 24, right: 4, left: 4, bottom: 0 }}
            // The sr-only table below already covers accessibility; Recharts'
            // own layer just adds a focusable group per bar that shows a
            // stray outline on tap/click with nothing useful to announce.
            accessibilityLayer={false}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="month"
              tickFormatter={monthLabel}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              content={chartTooltipContent({
                formatLabel: monthLabel,
                formatValue: (value) =>
                  `${value} activity event${value === 1 ? "" : "s"}`,
              })}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
              isAnimationActive={false}
            >
              {data.map((bucket, i) => (
                <Cell
                  key={bucket.month}
                  fill={
                    hasActivity && i === peakIndex
                      ? "var(--color-accent-2)"
                      : "var(--color-chart-1)"
                  }
                />
              ))}
              <LabelList
                dataKey="count"
                content={(props) => {
                  const { x, y, width, value, index } = props;
                  if (!hasActivity || index !== peakIndex) return null;
                  return (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) - 8}
                      textAnchor="middle"
                      className="fill-foreground text-xs font-medium"
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <table className="sr-only">
          <caption>Activity events by month</caption>
          <thead>
            <tr>
              <th>Month</th>
              <th>Events</th>
            </tr>
          </thead>
          <tbody>
            {data.map((bucket) => (
              <tr key={bucket.month}>
                <td>{monthLabel(bucket.month)}</td>
                <td>{bucket.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
