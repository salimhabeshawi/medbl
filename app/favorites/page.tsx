import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { FavoriteRow } from "@/components/favorite-row";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { getFavoriteCounts } from "@/lib/favorites";
import { BackLink } from "@/components/back-link";
import { getLocale, getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "My favorites" };

type PoemRow = {
  id: string;
  title: string;
  body: string;
  category_id: string | null;
  poem_number: number | null;
  categories: { name_am: string | null; name_en: string | null }[] | null;
  tags: string[] | null;
  poets:
    | { name_am: string; name_en: string }[]
    | { name_am: string; name_en: string }
    | null;
};

type PoetRow = { name_am: string; name_en: string };
type FavoriteDisplayRow = {
  poem: Omit<PoemRow, "category"> & { category: string | null };
  poet: PoetRow | null;
};

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().toLocaleLowerCase();
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
      "id, poem_id, created_at, poems(id, title, body, category_id, poem_number, categories(name_am, name_en), tags, poets(name_am, name_en))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (favorites ?? [])
    .map((fav) => {
      const poem = firstRelation<PoemRow>(fav.poems);
      if (!poem) return null;
      const poet = firstRelation<PoetRow>(poem.poets) ?? null;
      const category = firstRelation<{ name_am: string | null; name_en: string | null }>(poem.categories);
      return { poem: { ...poem, category: locale === "am" ? category?.name_am || category?.name_en || null : category?.name_en || category?.name_am || null }, poet } satisfies FavoriteDisplayRow;
    })
    .filter(
      (row): row is FavoriteDisplayRow => row !== null,
    );
  const filteredRows = q
    ? rows.filter(({ poem, poet }) =>
        [poem.title, ...(poem.tags ?? []), poet?.name_am, poet?.name_en]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(q),
      )
    : rows;
  const favoriteCounts = await getFavoriteCounts(rows.map((row) => row.poem.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <BackLink href="/">{tFav("back")}</BackLink>
      <div className="mb-8"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{tFav("eyebrow")}</p><h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tFav("title")}</h1><p className="text-sm leading-7 text-muted-foreground">{tFav("subtitle")}</p></div>
      <div className="mb-8"><UniversalSearch defaultValue={q} placeholder={tFav("searchPlaceholder")} /></div>

      {error ? (
        <EmptyState title={tFav("errorTitle")} description={tFav("errorDesc")} />
      ) : filteredRows.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((row) => (
            <FavoriteRow key={row.poem.id} poem={row.poem} poet={row.poet} favoriteCount={favoriteCounts.get(row.poem.id) ?? 0} />
          ))}
        </div>
      ) : (
        <EmptyState title={q ? tFav("noMatchTitle") : tFav("emptyTitle")} description={q ? tFav("noMatchDesc") : tFav("emptyDesc")} />
      )}
    </div>
  );
}