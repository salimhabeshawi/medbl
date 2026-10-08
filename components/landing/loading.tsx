import { Skeleton } from "@/components/ui/skeleton";

export function LandingStatsSkeleton() {
  return (
    <section className="border-y border-border/70 bg-accent/25 px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4">
        <Skeleton className="mx-auto h-12 w-20" />
        <Skeleton className="mx-auto h-12 w-20" />
        <Skeleton className="mx-auto h-12 w-20" />
      </div>
    </section>
  );
}
export function LandingPoemSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="mt-6 h-40 w-full" />
    </section>
  );
}
export function LandingPoetsSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Skeleton className="h-10 w-56" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    </section>
  );
}
export function LandingThemesSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Skeleton className="h-10 w-56" />
      <div className="mt-8 flex gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-20" />
      </div>
    </section>
  );
}
