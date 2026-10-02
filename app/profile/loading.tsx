import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton } from "@/components/page-skeletons";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="mb-8 h-4 w-24" />
      <Skeleton className="mb-3 h-10 w-64" />
      <Skeleton className="mb-10 h-5 w-full max-w-xl" />
      <section className="mb-12">
        <div className="mb-5 flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <FormSkeleton />
      </section>
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <FormSkeleton />
      </section>
    </div>
  );
}
