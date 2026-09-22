import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import {
  getCurrentUser,
  getFavoriteCounts,
  getFavoritePoemIds,
} from "@/lib/favorites";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { PoemCard } from "@/components/poem-card";
import { PostPoemAction } from "@/components/post-poem-action";
import { getLocale, getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Poems" };

const PAGE_SIZE = 20;

function param(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function pageUrl(params: {
  q: string;
  category: string;
  tag: string;
  page: number;
}): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/poems?${qs}` : "/poems";
}

type CategoryRecord = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

export default async function PoemsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    tag?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = param(params.q).trim();
  const category = param(params.category);
  const tag = param(params.tag);
  const page = Math.max(1, parseInt(param(params.page), 10) || 1);

  const locale = await getLocale();
  const tPoems = await getTranslations("Poems");
  const tCommon = await getTranslations("Common");

  const supabase = await createClient();

  let query = supabase
    .from("poems")
    .select(
      "id, title, body, category_id, categories(id, name_am, name_en), tags, attribution_status, poem_number, poet_id, poets(name_am, name_en), created_at",
      { count: "exact" },
    )
    .neq("attribution_status", "disputed")
    .order("created_at", { ascending: false });

  if (q) {
    const { data: searchResults } = await supabase.rpc("search_poems", {
      p_query: q,
      p_limit: 100,
    });
    const ids = ((searchResults ?? []) as { id: string }[]).map(
      (result) => result.id,
    );
    query =
      ids.length > 0
        ? query.in("id", ids)
        : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }
  if (category) query = query.eq("category_id", category);
  if (tag) query = query.contains("tags", [tag]);

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: poems, count } = await query;
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

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const user = await getCurrentUser();
  const favIds = await getFavoritePoemIds((poems ?? []).map((p) => p.id));
  const favoriteCounts = await getFavoriteCounts(
    (poems ?? []).map((p) => p.id),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">{tPoems("heading")}</h1>

      <div className="mb-6">
        <UniversalSearch defaultValue={q} categories={categories} />
        <div className="mt-4 flex justify-center">
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
            const poet = firstRelation<{
              name_am: string;
              name_en: string;
            }>(poem.poets);
            const catRelation = firstRelation<{
              id: string;
              name_am: string | null;
              name_en: string | null;
            }>(poem.categories);
            return (
              <PoemCard
                key={poem.id}
                poem={{
                  ...poem,
                  poemNumber: poem.poem_number,
                  category: catRelation,
                  poetName: poet?.name_am ?? poet?.name_en,
                }}
                favorited={favIds.has(poem.id)}
                favoriteCount={favoriteCounts.get(poem.id) ?? 0}
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

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-between">
          {page > 1 ? (
            <Link
              href={pageUrl({ q, category, tag, page: page - 1 })}
              className="rounded-md border border-border px-3 py-1.5 transition hover:bg-accent hover:text-foreground"
            >
              {tCommon("previous")}
            </Link>
          ) : null}
          <span className="text-muted-foreground">
            {tCommon("pageOf", {
              page: Math.min(page, totalPages),
              total: totalPages,
            })}
          </span>
          {page < totalPages ? (
            <Link
              href={pageUrl({ q, category, tag, page: page + 1 })}
              className="rounded-md border border-border px-3 py-1.5 transition hover:bg-accent hover:text-foreground"
            >
              {tCommon("next")}
            </Link>
          ) : null}
        </nav>
      )}
    </div>
  );
}
