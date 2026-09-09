import type { ReactNode } from "react";

export function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] [&>*]:snap-start">
        {children}
      </div>
    </section>
  );
}
