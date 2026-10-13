import { Skeleton } from "@/components/ui/skeleton";
import {
  PoemCardSkeleton,
  PoetCardSkeleton,
} from "@/components/page-skeletons";

export function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="manuscript-sheet mb-14 px-5 py-10 sm:px-10 sm:py-14">
        <Skeleton className="mx-auto h-9 w-full max-w-md" />
        <Skeleton className="mx-auto mt-3 h-5 w-full max-w-sm" />
        <Skeleton className="mx-auto my-6 h-px w-48" />
        <Skeleton className="mx-auto h-11 w-full max-w-2xl rounded-lg" />
        <div className="mt-4 flex justify-center">
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </section>
      <HomeSectionSkeleton count={6} />
      <HomeSectionSkeleton count={5} />
      <section className="mb-14">
        <SectionHeaderSkeleton />
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </section>
      <section>
        <SectionHeaderSkeleton />
        <div className="-mx-4 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0 lg:grid-cols-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="w-[78%] shrink-0 sm:w-auto">
              <PoetCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeaderSkeleton() {
  return (
    <div className="mb-5 flex items-end justify-between border-b border-border/70 pb-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

function HomeSectionSkeleton({ count }: { count: number }) {
  return (
    <section className="mb-14">
      <SectionHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <PoemCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
