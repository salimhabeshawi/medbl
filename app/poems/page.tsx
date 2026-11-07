import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getFavoritePoemIds } from "@/lib/favorites";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { PoemCard } from "@/components/poem-card";
import { PostPoemAction } from "@/components/post-poem-action";
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
import { getLocale, getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Poems" };

// 12 poems per page: 3-column grid × 4 rows on desktop.
const PAGE_SIZE = 12;

function param(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function pageUrl(params: {
  q: string;
  category: string;
  tag: string;
  page: number;
  sort: ListSort;
}): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.sort !== "date_desc") search.set("sort", params.sort);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/poems?${qs}` : "/poems";
}

/**
 * Page numbers to show: every page when there are few, otherwise the first and
 * last page plus the current one and its neighbours, with ellipses in between.
 */
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

type CategoryRecord = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

type PoemPageRow = {
  id: string;
  title: string;
  body: string;
  category_id: string | null;
  category_name_am: string | null;
  category_name_en: string | null;
  tags: string[] | null;
  attribution_status: string;
  poet_id: string;
  poet_name_am: string;
  poet_name_en: string | null;
  poem_number: number;
  view_count: number;
  created_at: string;
  like_count: number;
  total_count: number;
};

export default async function PoemsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    tag?: string | string[];
    page?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = param(params.q).trim();
  const category = param(params.category);
  const tag = param(params.tag);
  const page = Math.max(1, parseInt(param(params.page), 10) || 1);
  const requestedSort = param(params.sort);
  const sort: ListSort = [
    "date_desc",
    "date_asc",
    "alphabetical",
    "likes_desc",
    "likes_asc",
  ].includes(requestedSort)
    ? (requestedSort as ListSort)
    : "date_desc";

  const locale = await getLocale();
  const tPoems = await getTranslations("Poems");
  const tCommon = await getTranslations("Common");

  const supabase = await createClient();

  const { data: poemRows } = await supabase.rpc("get_poems_page", {
    p_sort: sort,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
    p_query: q || null,
    p_category_id: category || null,
    p_tag: tag || null,
  });
  const poems = (poemRows ?? []) as PoemPageRow[];
  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id, name_am, name_en")
    .order("name_am");
  const categories = (categoryRows ?? []) as CategoryRecord[];

  const selectedCategoryObj = categories.find((c) => c.id === category);
  const selectedCategoryLabel = selectedCategoryObj
    ? locale === "am"
      ? selectedCategoryObj.name_am || selectedCategoryObj.name_en
      : selectedCategoryObj.name_en || selectedCategoryObj.name_am
    : category;

  const totalCount = Number(poems[0]?.total_count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const user = await getCurrentUser();
  const favIds = await getFavoritePoemIds((poems ?? []).map((p) => p.id));
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">{tPoems("heading")}</h1>

      <div className="mb-6">
        <UniversalSearch
          key={category || "all"}
          defaultValue={q}
          categories={categories}
          selectedCategory={category}
          syncCategoryToUrl
        />
        <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <ListSortSelect
            value={sort}
            options={[
              "date_desc",
              "date_asc",
              "alphabetical",
              "likes_desc",
              "likes_asc",
            ]}
          />
          <PostPoemAction />
        </div>
      </div>

      {(q || category || tag) && (
        <p className="mb-4 text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
          <span>{tPoems("filterCategory")}:</span>
          {q ? (
            <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
              “{q}”
            </span>
          ) : null}
          {category ? (
            <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
              {selectedCategoryLabel}
            </span>
          ) : null}
          {tag ? (
            <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
              #{tag}
            </span>
          ) : null}
          <Link href="/poems" className="underline ml-1">
            {tCommon("cancel")}
          </Link>
        </p>
      )}

      {poems && poems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {poems.map((poem) => {
            return (
              <PoemCard
                key={poem.id}
                poem={{
                  ...poem,
                  poemNumber: poem.poem_number,
                  category: poem.category_id
                    ? {
                        id: poem.category_id,
                        name_am: poem.category_name_am,
                        name_en: poem.category_name_en,
                      }
                    : null,
                  poetName: poem.poet_name_am ?? poem.poet_name_en,
                  viewCount: poem.view_count ?? 0,
                }}
                favorited={favIds.has(poem.id)}
                favoriteCount={Number(poem.like_count ?? 0)}
                showFavorite={Boolean(user)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={tPoems("noPoemsTitle")}
          description={tPoems("noPoemsDesc")}
        />
      )}

      {totalPages > 1 ? (
        <>
          <Pagination className="mt-8">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                {page > 1 ? (
                  <PaginationPrevious
                    href={pageUrl({ q, category, tag, page: page - 1, sort })}
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
                      href={pageUrl({ q, category, tag, page: item, sort })}
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
                    href={pageUrl({ q, category, tag, page: page + 1, sort })}
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
