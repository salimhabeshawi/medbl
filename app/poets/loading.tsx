import { Skeleton } from "@/components/ui/skeleton";
import { PoetCardSkeleton } from "@/components/page-skeletons";

export default function PoetsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-3 h-10 w-64" />
      <Skeleton className="mb-8 h-5 w-full max-w-xl" />
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_13rem]">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="size-11 rounded-lg sm:w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }, (_, index) => (
          <PoetCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
