import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { FavoriteRow } from "@/components/favorite-row";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { getFavoriteCounts } from "@/lib/favorites";
import { optionList, type ListFilterOption } from "@/lib/filter-options";
import { ListFilters } from "@/components/list-filters";
import { BackLink } from "@/components/back-link";
import { getLocale, getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "My favorites" };

type CategoryRow = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

type PoemRow = {
  id: string;
  title: string;
  body: string;
  category_id: string | null;
  poem_number: number | null;
  view_count: number | null;
  categories: CategoryRow[] | null;
  tags: string[] | null;
  poets:
    | { id: string; name_am: string; name_en: string }[]
    | { id: string; name_am: string; name_en: string }
    | null;
};

type PoetRow = { id: string; name_am: string; name_en: string };
type FavoriteDisplayRow = {
  poem: Omit<PoemRow, "category"> & { category: string | null };
  poet: PoetRow | null;
};

function param(value?: string | string[]): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    poet?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = param(params.q).trim().toLocaleLowerCase();
  const category = param(params.category);
  const poet = param(params.poet);
  const locale = await getLocale();
  const tFav = await getTranslations("Favorites");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(
      "id, poem_id, created_at, poems(id, title, body, category_id, poem_number, view_count, categories(id, name_am, name_en), tags, poets(id, name_am, name_en))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (favorites ?? [])
    .map((fav) => {
      const poem = firstRelation<PoemRow>(fav.poems);
      if (!poem) return null;
      const poet = firstRelation<PoetRow>(poem.poets) ?? null;
      const categoryRow = firstRelation<CategoryRow>(poem.categories);
      return { poem: { ...poem, category: locale === "am" ? categoryRow?.name_am || categoryRow?.name_en || null : categoryRow?.name_en || categoryRow?.name_am || null }, poet } satisfies FavoriteDisplayRow;
    })
    .filter(
      (row): row is FavoriteDisplayRow => row !== null,
    );

  // Filter options come from THIS user's favorites only — never the site-wide
  // category/poet registries.
  const categoryOptions: ListFilterOption[] = optionList(
    rows.map(({ poem }) =>
      poem.category_id
        ? { id: poem.category_id, label: poem.category ?? poem.category_id }
        : null,
    ),
  );
  const poetOptions: ListFilterOption[] = optionList(
    rows.map(({ poet }) =>
      poet ? { id: poet.id, label: poet.name_am || poet.name_en } : null,
    ),
  );

  // Category and poet filters combine (category AND poet), and both stack on
  // top of the client-side text search. Filter state lives in the URL.
  const filteredRows = rows
    .filter(
      (row) =>
        (!category || row.poem.category_id === category) &&
        (!poet || row.poet?.id === poet),
    )
    .filter(({ poem, poet }) =>
      q
        ? [poem.title, ...(poem.tags ?? []), poet?.name_am, poet?.name_en]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase()
            .includes(q)
        : true,
    );
  const favoriteCounts = await getFavoriteCounts(rows.map((row) => row.poem.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <BackLink href="/">{tFav("back")}</BackLink>
      <div className="mb-8"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{tFav("eyebrow")}</p><h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tFav("title")}</h1><p className="text-sm leading-7 text-muted-foreground">{tFav("subtitle")}</p></div>
      <div className="mb-8"><UniversalSearch defaultValue={q} placeholder={tFav("searchPlaceholder")} /></div>

      {error ? (
        <EmptyState title={tFav("errorTitle")} description={tFav("errorDesc")} />
      ) : rows.length === 0 ? (
        <EmptyState title={tFav("emptyTitle")} description={tFav("emptyDesc")} />
      ) : (
        <>
          <ListFilters
            categoryOptions={categoryOptions}
            poetOptions={poetOptions}
            categoryValue={category}
            poetValue={poet}
          />
          {filteredRows.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRows.map((row) => (
                <FavoriteRow key={row.poem.id} poem={row.poem} poet={row.poet} favoriteCount={favoriteCounts.get(row.poem.id) ?? 0} viewCount={row.poem.view_count ?? 0} />
              ))}
            </div>
          ) : (
            <EmptyState title={tFav("noMatchTitle")} description={tFav("noMatchDesc")} />
          )}
        </>
      )}
    </div>
  );
}