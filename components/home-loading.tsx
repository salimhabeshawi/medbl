import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PoemCardSkeleton,
  PoetCardSkeleton,
} from "@/components/page-skeletons";

export function HomeLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="-mx-4 mb-12 border-y border-border bg-accent px-4 py-8 sm:mx-0 sm:rounded-lg sm:border">
        <Skeleton className="mx-auto h-8 w-56" />
        <Skeleton className="mx-auto mt-3 h-5 w-full max-w-xl" />
        <Skeleton className="mx-auto mt-6 h-11 w-full max-w-2xl rounded-lg" />
      </section>
      <HomeSectionSkeleton count={6} />
      <HomeSectionSkeleton count={5} />
      <section className="mb-12">
        <Skeleton className="mb-4 h-8 w-56" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Link href="/poets" aria-hidden="true" tabIndex={-1}>
            <Skeleton className="h-4 w-24" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }, (_, index) => (
            <PoetCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

function HomeSectionSkeleton({ count }: { count: number }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <PoemCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
