import { Skeleton } from "@/components/ui/skeleton";
import { SubmissionCardSkeleton } from "@/components/page-skeletons";

export default function ModerateSubmissionsLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-4 w-28" />
      <Skeleton className="mb-6 h-8 w-64" />
      <div className="space-y-4 sm:space-y-5">
        {Array.from({ length: 4 }, (_, index) => (
          <SubmissionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
