import { Skeleton } from "@/components/ui/skeleton";
import { PoemCardSkeleton } from "@/components/page-skeletons";

export default function PoemLoading() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Skeleton className="mb-8 h-4 w-24" />
      <div className="manuscript-sheet px-5 pb-10 pt-10 sm:px-14 sm:pb-14 sm:pt-14">
        <div className="flex flex-col items-center">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="mt-4 h-10 w-3/4 max-w-md" />
          <Skeleton className="mt-4 h-5 w-40" />
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-4xl" />
            <Skeleton className="h-6 w-24 rounded-4xl" />
          </div>
        </div>
        <Skeleton className="mx-auto my-9 h-px w-56 sm:my-11" />
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-4/6" />
          <Skeleton className="mt-6 h-5 w-5/6" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <Skeleton className="mx-auto mb-7 mt-10 h-px w-56 sm:mt-12" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Skeleton className="h-13 w-72 rounded-full" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <section className="mt-16">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto mb-8 mt-4 h-px w-40" />
        <Skeleton className="mb-4 h-6 w-56" />
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <PoemCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </article>
  );
}
