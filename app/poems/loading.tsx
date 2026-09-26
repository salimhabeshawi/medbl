import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while /poems (or another page of /poems) is being fetched, so paginating
 * never looks frozen. Mirrors the real page's shape: heading, search bar,
 * 3-column card grid, pagination.
 */
export default function PoemsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Skeleton className="mb-6 h-9 w-40" />

      <div className="mb-6">
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="mt-4 flex justify-center">
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="border-border bg-card shadow-none">
            <CardHeader className="gap-3">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="size-8 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex flex-wrap gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-4xl" />
                <Skeleton className="h-5 w-16 rounded-4xl" />
                <Skeleton className="h-5 w-14 rounded-4xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}
