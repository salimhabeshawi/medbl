import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton } from "@/components/page-skeletons";

export default function SubmitLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="mb-10 h-10 w-64" />
      <Skeleton className="mb-3 h-10 w-72" />
      <Skeleton className="mb-10 h-5 w-full max-w-xl" />
      <FormSkeleton />
    </div>
  );
}
