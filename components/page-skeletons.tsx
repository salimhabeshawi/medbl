import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PoemCardSkeleton() {
  return (
    <Card className="h-full gap-0 border-border bg-card py-0 shadow-none">
      <CardHeader className="gap-0 px-5 pt-5">
        <div className="flex min-h-9 items-center justify-between gap-2">
          <Skeleton className="h-4 w-14" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-12 rounded-full" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
        <Skeleton className="mt-3 h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-28" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-5 pb-5">
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-auto flex flex-wrap gap-2 border-t border-dashed border-border/80 pt-4">
          <Skeleton className="h-5 w-20 rounded-4xl" />
          <Skeleton className="h-5 w-16 rounded-4xl" />
          <Skeleton className="h-5 w-14 rounded-4xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PoetCardSkeleton() {
  return (
    <div className="flex h-full items-start gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-4xl" />
          <Skeleton className="h-5 w-14 rounded-4xl" />
        </div>
      </div>
    </div>
  );
}

export function SubmissionCardSkeleton() {
  return (
    <Card className="border-primary/15 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-4xl" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ModerationSubmissionSkeleton() {
  return (
    <Card className="border-primary/15 py-0 shadow-sm">
      <CardHeader className="gap-3 border-b border-border/70 bg-accent/20 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-4xl" />
          <Skeleton className="h-6 w-32 rounded-4xl" />
        </div>
        <Skeleton className="h-7 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 w-full sm:w-32" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportCardSkeleton() {
  return (
    <Card className="border-primary/15 bg-card shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function ModerationOverviewCardSkeleton() {
  return (
    <Card className="border-primary/15 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-28" />
      </CardContent>
    </Card>
  );
}

export function SubmissionFormSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-11 w-40 rounded-lg" />
        </CardContent>
      </Card>
      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

export function PoetDetailsSkeleton() {
  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader className="border-b border-border/70 bg-accent/20">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <Skeleton className="h-11 w-48 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function AccountFormSkeleton() {
  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader className="border-b border-border/70 bg-accent/20">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function PasswordFormSkeleton() {
  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader className="border-b border-border/70 bg-accent/20">
        <Skeleton className="h-6 w-44" />
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </CardContent>
    </Card>
  );
}

/** /login and /signup: mirrors AuthShell. `extraRow` adds signup's terms row. */
export function AuthSkeleton({ extraRow = false }: { extraRow?: boolean }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-sm">
        <Skeleton className="mb-8 h-4 w-24" />
        <div className="manuscript-sheet px-6 py-9 sm:px-9 sm:py-10">
          <div className="flex flex-col items-center">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="mt-4 h-8 w-36" />
          </div>
          <Skeleton className="mx-auto mb-6 mt-4 h-px w-32" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <div className="my-6 flex items-center gap-3">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-5" />
            <Skeleton className="h-px flex-1" />
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            {extraRow ? <Skeleton className="h-10 w-full" /> : null}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="mx-auto mt-6 h-4 w-44" />
        </div>
      </div>
    </div>
  );
}
