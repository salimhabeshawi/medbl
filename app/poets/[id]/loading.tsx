import { Skeleton } from "@/components/ui/skeleton";
import { PoemCardSkeleton } from "@/components/page-skeletons";

export default function PoetLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Skeleton className="mb-8 h-4 w-28" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-2 h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-32" />
      <Skeleton className="mt-6 h-20 w-full max-w-2xl" />
      <section className="mt-12">
        <Skeleton className="mb-4 h-8 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <PoemCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
