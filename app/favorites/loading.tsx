import { Skeleton } from "@/components/ui/skeleton";
import { PoemCardSkeleton } from "@/components/page-skeletons";

export default function FavoritesLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="mb-8 h-4 w-24" />
      <Skeleton className="mb-3 h-10 w-64" />
      <Skeleton className="mb-8 h-5 w-full max-w-xl" />
      <Skeleton className="mb-8 h-11 w-full rounded-lg" />
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-10 w-52 rounded-lg" />
        <Skeleton className="h-10 w-52 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <PoemCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
