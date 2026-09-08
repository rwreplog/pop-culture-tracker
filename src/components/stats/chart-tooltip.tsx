import type { TooltipContentProps } from "recharts";

type ChartTooltipContentProps = TooltipContentProps & {
  formatLabel?: (label: string) => string;
  formatValue?: (value: number) => string;
};

/** Shared hover tooltip for the stats page's Recharts charts, styled to match the app's popover surface. */
export function ChartTooltipContent({
  active,
  payload,
  label,
  formatLabel,
  formatValue,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover text-popover-foreground ring-foreground/10 rounded-lg px-3 py-2 text-sm shadow-lg ring-1">
      {label != null ? (
        <p className="text-muted-foreground text-xs">
          {formatLabel ? formatLabel(String(label)) : label}
        </p>
      ) : null}
      {payload.map((entry) => {
        const value = Number(entry.value);
        return (
          <p key={String(entry.dataKey ?? entry.name)} className="font-medium">
            {formatValue ? formatValue(value) : value}
          </p>
        );
      })}
    </div>
  );
}

/** Wraps ChartTooltipContent as a Recharts `content` render function, so injected tooltip props satisfy the type Recharts expects. */
export function chartTooltipContent(
  props: Omit<ChartTooltipContentProps, keyof TooltipContentProps>,
) {
  function BoundChartTooltipContent(tooltipProps: TooltipContentProps) {
    return <ChartTooltipContent {...tooltipProps} {...props} />;
  }
  return BoundChartTooltipContent;
}
