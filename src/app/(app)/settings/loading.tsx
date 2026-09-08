import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div
      className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6"
      aria-hidden="true"
    >
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
