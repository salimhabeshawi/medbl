import { Skeleton } from "@/components/ui/skeleton";
import { ReportCardSkeleton } from "@/components/page-skeletons";

export default function ModerateReportsLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-4 w-28" />
      <Skeleton className="mb-6 h-8 w-56" />
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, index) => (
          <ReportCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
