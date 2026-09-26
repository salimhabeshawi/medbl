"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTranslations } from "next-intl";
import type { ListFilterOption } from "@/lib/filter-options";

// Radix Select rejects "" as an item value, so "all" is the sentinel for
// "no filter applied". Category and poet ids are uuids, never "all".
const ALL = "all";

/**
 * Category + poet filters for a user's own list (/my-submissions,
 * /favorites). The options are computed server-side from that user's rows
 * and passed in; the selected values live in the URL (`?category=` /
 * `?poet=`) so the filter state survives a refresh and is shareable.
 */
export function ListFilters({
  categoryOptions,
  poetOptions,
  categoryValue,
  poetValue,
}: {
  categoryOptions: ListFilterOption[];
  poetOptions: ListFilterOption[];
  categoryValue: string;
  poetValue: string;
}) {
  const tFilters = useTranslations("Filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasActiveFilter = Boolean(categoryValue || poetValue);
  // A value coming from the URL still renders its select even if the option
  // list came back empty, so the stale filter stays visible and clearable.
  const showCategory = categoryOptions.length > 0 || Boolean(categoryValue);
  const showPoet = poetOptions.length > 0 || Boolean(poetValue);

  if (!showCategory && !showPoet) return null;

  // Rebuild from the current query string so unrelated params (pagination,
  // the favorites search `q`, ...) survive a filter change.
  function pushParams(params: URLSearchParams) {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function applyFilter(key: "category" | "poet", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) params.set(key, value);
    else params.delete(key);
    // A different filter means a different result set — never keep a page.
    params.delete("page");
    pushParams(params);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("poet");
    params.delete("page");
    pushParams(params);
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {showCategory ? (
        <div className="flex flex-col gap-2 text-sm font-medium sm:w-52">
          <span>{tFilters("filterCategory")}</span>
          <Select
            value={categoryValue || ALL}
            onValueChange={(value) => applyFilter("category", value)}
          >
            <SelectTrigger
              className="h-10 w-full"
              aria-label={tFilters("filterCategory")}
            >
              <SelectValue placeholder={tFilters("allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{tFilters("allCategories")}</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {showPoet ? (
        <div className="flex flex-col gap-2 text-sm font-medium sm:w-52">
          <span>{tFilters("filterPoet")}</span>
          <Select
            value={poetValue || ALL}
            onValueChange={(value) => applyFilter("poet", value)}
          >
            <SelectTrigger
              className="h-10 w-full"
              aria-label={tFilters("filterPoet")}
            >
              <SelectValue placeholder={tFilters("allPoets")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{tFilters("allPoets")}</SelectItem>
              {poetOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {hasActiveFilter ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="self-start sm:self-end"
        >
          <X className="size-4" /> {tFilters("clearFilters")}
        </Button>
      ) : null}
    </div>
  );
}
