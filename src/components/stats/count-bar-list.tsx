"use client";

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartTooltipContent } from "@/components/stats/chart-tooltip";
import type { CountEntry } from "@/lib/services/insights/queries";

const NAME_AXIS_WIDTH = 112;
const ROW_HEIGHT = 32;

function truncateName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
}

/** A horizontal bar chart for ranked name/count pairs (genres, creators). */
export function CountBarList({ entries }: { entries: CountEntry[] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={entries.length * ROW_HEIGHT}>
        <BarChart
          data={entries}
          layout="vertical"
          margin={{ top: 0, right: 28, left: 0, bottom: 0 }}
          barCategoryGap="28%"
          // The sr-only table below already covers accessibility; see
          // activity-chart.tsx for why the built-in layer is disabled.
          accessibilityLayer={false}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            width={NAME_AXIS_WIDTH}
            tickFormatter={truncateName}
            tick={{ fill: "var(--color-foreground)", fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            content={chartTooltipContent({
              formatValue: (value) => `${value} item${value === 1 ? "" : "s"}`,
            })}
          />
          <Bar
            dataKey="count"
            fill="var(--color-chart-1)"
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="count"
              position="right"
              className="fill-muted-foreground text-xs"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>Counts by name</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.name}>
              <td>{entry.name}</td>
              <td>{entry.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
