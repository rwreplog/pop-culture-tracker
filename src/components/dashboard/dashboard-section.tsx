import type { ReactNode } from "react";

/**
 * A horizontal-scroll rail of MediaCards below `md` (unchanged from
 * before — that's the right pattern for touch), which becomes a
 * non-scrolling grid at `md` and up so a wide desktop screen shows more
 * at once instead of just scrolling sideways with a mouse. Column counts
 * match Library/Discover's grids for visual consistency.
 */
export function DashboardSection({
  title,
  children,
}: {
  /** Omit to render just the rail/grid with no heading — e.g. reused for
   * media detail's Related tab, where the Tabs UI already labels it. */
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {title ? (
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      ) : null}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] md:grid md:grid-cols-4 md:overflow-visible md:pb-0 lg:grid-cols-6 [&>*]:snap-start">
        {children}
      </div>
    </section>
  );
}
