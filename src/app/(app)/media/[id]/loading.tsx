import { Skeleton } from "@/components/ui/skeleton";

export default function MediaDetailLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row">
      <Skeleton className="h-72 w-48 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="mt-2 h-16 w-full" />
        <Skeleton className="mt-2 h-8 w-full max-w-xs" />
        <Skeleton className="h-8 w-full max-w-xs" />
      </div>
    </div>
  );
}
