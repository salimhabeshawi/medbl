"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type ListSort =
  | "date_desc"
  | "date_asc"
  | "alphabetical"
  | "likes_desc"
  | "likes_asc"
  | "poems_desc"
  | "poems_asc"
  | "avg_likes_desc"
  | "avg_likes_asc";

export function ListSortSelect({
  value,
  options,
  heightClassName = "h-10",
  compact = false,
}: {
  value: ListSort;
  options: ListSort[];
  heightClassName?: "h-10" | "h-11";
  compact?: boolean;
}) {
  const t = useTranslations("Sort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeSort(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextValue);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="relative min-w-0">
      <ArrowDownUp
        className={
          compact
            ? "pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground max-sm:left-1/2 max-sm:-translate-x-1/2"
            : "pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        }
        aria-hidden="true"
      />
      <Select value={value} onValueChange={changeSort}>
        <SelectTrigger
          className={
            compact
              ? `${heightClassName} mobile-filter-trigger min-h-11 w-11 shrink-0 justify-center pl-0 leading-none sm:w-full sm:justify-between sm:pl-9`
              : `${heightClassName} w-full min-w-48 pl-9 sm:w-56`
          }
          aria-label={t("label")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {t(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
