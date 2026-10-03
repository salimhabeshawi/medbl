import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { ListSortSelect, type ListSort } from "@/components/list-sort-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Poets" };

const PAGE_SIZE = 12;

function param(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function pageUrl(params: { q: string; page: number; sort: ListSort }): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.sort !== "poems_desc") search.set("sort", params.sort);
  if (params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/poets?${query}` : "/poets";
}

function pageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const sorted = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((candidate) => candidate >= 1 && candidate <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const candidate of sorted) {
    if (previous && candidate - previous > 1) items.push("ellipsis");
    items.push(candidate);
    previous = candidate;
  }
  return items;
}

type PoetRow = {
  id: string;
  name_am: string;
  name_en: string | null;
  verified: boolean;
  poems_count: number;
  likes_count: number;
  avg_likes_per_poem: number | null;
  total_count: number;
};

export default async function PoetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = param(params.q).trim();
  const rawSort = param(params.sort);
  const page = Math.max(1, parseInt(param(params.page), 10) || 1);
  const sort: ListSort = [
    "poems_desc",
    "poems_asc",
    "likes_desc",
    "likes_asc",
    "avg_likes_desc",
    "avg_likes_asc",
  ].includes(rawSort ?? "")
    ? (rawSort as ListSort)
    : "poems_desc";
  const tPoets = await getTranslations("Poets");
  const tCommon = await getTranslations("Common");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("list_poets", {
    p_sort: sort,
    p_query: q || null,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  const poets = (data ?? []) as PoetRow[];
  const totalCount = Number(poets[0]?.total_count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {tPoets("registry")}
        </p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {tPoets("heading")}
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          {tPoets("subheading")}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="min-w-0 flex-1">
          <UniversalSearch
            mode="poets"
            defaultValue={q}
            placeholder={tPoets("searchPlaceholder")}
          />
        </div>
        <ListSortSelect
          value={sort}
          options={[
            "poems_desc",
            "poems_asc",
            "likes_desc",
            "likes_asc",
            "avg_likes_desc",
            "avg_likes_asc",
          ]}
          heightClassName="h-11"
          compact
        />
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          {tPoets("loadError")}
        </p>
      ) : poets && poets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {poets.map((poet) => {
            return (
              <Card
                key={poet.id}
                className="content-card border border-border bg-card shadow-none"
              >
                <Link
                  href={`/poets/${poet.id}`}
                  className="block p-4 text-left"
                >
                  <div className="font-semibold">{poet.name_am}</div>
                  {poet.name_en ? (
                    <div className="text-sm text-muted-foreground">
                      {poet.name_en}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {tPoets("poemCount", { count: poet.poems_count })}
                    </Badge>
                    <Badge variant="outline">
                      {tPoets("likeCount", { count: poet.likes_count })}
                    </Badge>
                    {poet.avg_likes_per_poem !== null ? (
                      <Badge variant="secondary">
                        {tPoets("avgLikesPerPoem", {
                          value: Number(poet.avg_likes_per_poem).toFixed(1),
                        })}
                      </Badge>
                    ) : null}
                  </div>
                  {poet.verified ? (
                    <Badge variant="secondary" className="mt-3">
                      {tPoets("verified")}
                    </Badge>
                  ) : null}
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={q ? tPoets("noPoetsTitle") : tPoets("noPoetsYet")}
          description={q ? tPoets("noPoetsDesc") : tPoets("noPoetsYetDesc")}
        />
      )}

      {totalPages > 1 ? (
        <>
          <Pagination className="mt-8">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                {page > 1 ? (
                  <PaginationPrevious
                    href={pageUrl({ q, page: page - 1, sort })}
                    text={tCommon("previous")}
                    aria-label={tCommon("previous")}
                  />
                ) : (
                  <PaginationPrevious
                    text={tCommon("previous")}
                    aria-label={tCommon("previous")}
                    aria-disabled="true"
                    className="pointer-events-none opacity-50"
                  />
                )}
              </PaginationItem>

              {pageItems(page, totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href={pageUrl({ q, page: item, sort })}
                      isActive={item === page}
                      aria-label={tCommon("pageOf", {
                        page: item,
                        total: totalPages,
                      })}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                {page < totalPages ? (
                  <PaginationNext
                    href={pageUrl({ q, page: page + 1, sort })}
                    text={tCommon("next")}
                    aria-label={tCommon("next")}
                  />
                ) : (
                  <PaginationNext
                    text={tCommon("next")}
                    aria-label={tCommon("next")}
                    aria-disabled="true"
                    className="pointer-events-none opacity-50"
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {tCommon("pageOf", {
              page: Math.min(page, totalPages),
              total: totalPages,
            })}
          </p>
        </>
      ) : null}
    </div>
  );
}
