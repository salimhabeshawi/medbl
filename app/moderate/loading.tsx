import { Skeleton } from "@/components/ui/skeleton";
import { SubmissionCardSkeleton } from "@/components/page-skeletons";

export default function ModerateLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-4 w-28" />
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <SubmissionCardSkeleton key={index} />
        ))}
      </div>
      <section className="mt-10 border-t border-border/70 pt-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
}
