import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PoemCardSkeleton } from "@/components/page-skeletons";

export default function PoemLoading() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <Skeleton className="mb-8 h-4 w-24" />
      <Card className="border border-border bg-card shadow-none">
        <CardHeader className="gap-5 border-b border-border bg-accent/45 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex justify-between gap-5">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-8 w-12 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-4xl" />
            <Skeleton className="h-6 w-24 rounded-4xl" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 py-8 sm:px-8">
          <Skeleton className="mx-auto h-5 w-5/6" />
          <Skeleton className="mx-auto h-5 w-4/5" />
          <Skeleton className="mx-auto h-5 w-3/4" />
          <Skeleton className="mt-8 h-px w-full" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
      <div className="mt-6 grid grid-cols-2 gap-3 py-2 sm:mt-8">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <section className="mt-12">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-6 w-56" />
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <PoemCardSkeleton key={index} />
          ))}
        </div>
        <Skeleton className="mb-4 h-6 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <PoemCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </article>
  );
}
