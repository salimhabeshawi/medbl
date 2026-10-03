"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

const statuses = ["", "pending", "approved", "rejected"] as const;

export function SubmissionStatusFilters({
  value,
  counts,
  className,
}: {
  value: string;
  counts: Record<(typeof statuses)[number], number>;
  className?: string;
}) {
  const t = useTranslations("MySubmissions");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function selectStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div
      className={className ?? "mb-6 flex flex-wrap gap-2"}
      aria-label={t("statusFilters")}
    >
      {statuses.map((status) => (
        <Button
          key={status || "all"}
          type="button"
          size="sm"
          variant={value === status ? "default" : "outline"}
          onClick={() => selectStatus(status)}
        >
          {status === "pending"
            ? t("pending")
            : status === "approved"
              ? t("approved")
              : status === "rejected"
                ? t("rejected")
                : t("all")}{" "}
          ({counts[status]})
        </Button>
      ))}
    </div>
  );
}
