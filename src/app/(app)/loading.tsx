import { DashboardSectionSkeleton } from "@/components/layout/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardSectionSkeleton />
      <DashboardSectionSkeleton />
    </div>
  );
}
