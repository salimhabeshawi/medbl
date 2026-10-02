import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignupLoading() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Skeleton className="mb-4 h-4 w-24" />
        <Card className="w-full border-primary/15 shadow-lg">
          <CardContent className="space-y-6 p-8">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-4 w-5" />
              <Skeleton className="h-px flex-1" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="flex items-start gap-2">
                <Skeleton className="mt-1 size-4 shrink-0 rounded-sm" />
                <Skeleton className="h-12 flex-1" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="mx-auto h-4 w-44" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
