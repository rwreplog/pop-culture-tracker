import { Skeleton } from "@/components/ui/skeleton";

export default function SurpriseLoading() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6" aria-hidden="true">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
