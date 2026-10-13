import { Skeleton } from "@/components/ui/skeleton";
import { PoemCardSkeleton } from "@/components/page-skeletons";

export default function PoetLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Skeleton className="mb-8 h-4 w-28" />
      <div className="manuscript-sheet flex flex-col items-center px-5 py-10 sm:px-12 sm:py-14">
        <Skeleton className="size-20 rounded-full sm:size-24" />
        <Skeleton className="mt-5 h-10 w-64" />
        <Skeleton className="mt-2 h-5 w-40" />
        <Skeleton className="mt-1 h-4 w-32" />
        <Skeleton className="my-6 h-px w-48" />
        <Skeleton className="h-20 w-full max-w-2xl" />
      </div>
      <section className="mt-14">
        <div className="mb-5 border-b border-border/70 pb-3">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <PoemCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
