import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
            <Skeleton className="size-10 shrink-0 rounded-full" />
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
    </article>
  );
}
