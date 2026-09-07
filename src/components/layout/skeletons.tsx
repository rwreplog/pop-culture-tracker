import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-2/3 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}

export function CardGridSkeleton({
  count = 12,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <MediaCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ListCardSkeleton() {
  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="aspect-2/3 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}

export function ListCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <ListCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-12 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}

export function DashboardSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-4 overflow-x-hidden pb-1">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="w-32 shrink-0 sm:w-40">
            <MediaCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="size-9" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function GoalCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <GoalCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function RowListSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <RowSkeleton key={index} />
      ))}
    </div>
  );
}
