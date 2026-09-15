import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import {
  getCurrentUser,
  getFavoriteCounts,
  getFavoritePoemIds,
} from "@/lib/favorites";
import { Badge } from "@/components/ui/badge";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { PoemCard } from "@/components/poem-card";
import { PostPoemAction } from "@/components/post-poem-action";
import { getLocale, getTranslations } from "next-intl/server";

type FeaturedPoet = {
  id: string;
  name_am: string;
  name_en: string | null;
  poem_count: number;
  liked_poem_count?: number; // poems with ≥ 1 favourite (from get_featured_poets v2)
  favorite_count: number;
  favorites_per_poem: number;
  favorites_per_poem_percent?: number;
};

type FeaturedPoem = {
  id: string;
  title: string;
  body: string;
  category_id?: string | null;
  category_name_am?: string | null;
  category_name_en?: string | null;
  poet_name_am: string;
  poet_name_en: string | null;
  favorite_count: number;
};

type CategoryRecord = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

async function getFeaturedPoets(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<FeaturedPoet[]> {
  const { data, error } = await supabase.rpc("get_featured_poets", {
    p_limit: 5,
  });
  if (!error && data) return data as FeaturedPoet[];

  const { data: poems } = await supabase
    .from("poems")
    .select("poet_id, poets(id, name_am, name_en)")
    .neq("attribution_status", "disputed");

  const byPoet = new Map<string, FeaturedPoet>();
  for (const row of poems ?? []) {
    const relation = Array.isArray(row.poets) ? row.poets[0] : row.poets;
    if (!relation) continue;
    const current = byPoet.get(row.poet_id) ?? {
      id: relation.id,
      name_am: relation.name_am,
      name_en: relation.name_en,
      poem_count: 0,
      liked_poem_count: 0,
      favorite_count: 0,
      favorites_per_poem: 0,
    };
    current.poem_count += 1;
    byPoet.set(row.poet_id, current);
  }

  return [...byPoet.values()]
    .sort(
      (a, b) =>
        b.poem_count - a.poem_count || a.name_am.localeCompare(b.name_am),
    )
    .slice(0, 5);
}

export default async function Home() {
  const supabase = await createClient();
  const locale = await getLocale();
  const tHome = await getTranslations("Home");
  const tPoets = await getTranslations("Poets");

  const [
    { data: recentPoems },
    featuredPoets,
    { data: featuredPoemRows },
    { data: categoryRows },
    { data: tagRows },
  ] = await Promise.all([
    supabase
      .from("poems")
      .select(
        "id, title, body, attribution_status, category_id, categories(id, name_am, name_en), tags, poet_id, poets(name_am, name_en), created_at",
      )
      .order("created_at", { ascending: false })
      .limit(6),
    getFeaturedPoets(supabase),
    supabase.rpc("get_featured_poems", { p_limit: 5 }),
    supabase.from("categories").select("id, name_am, name_en").order("name_am"),
    supabase.from("poems").select("tags").neq("attribution_status", "disputed"),
  ]);
  const featuredPoems = (featuredPoemRows ?? []) as FeaturedPoem[];
  const categories = (categoryRows ?? []) as CategoryRecord[];
  const tags = [
    ...new Set(
      (tagRows ?? []).flatMap((row) =>
        Array.isArray(row.tags) ? row.tags : [],
      ),
    ),
  ].sort();

  const user = await getCurrentUser();
  // Deduplicate: a poem can appear in both recentPoems and featuredPoems.
  // Passing duplicate ids to get_poem_favorite_counts would multiply the
  // count for each duplicate occurrence.
  const allPoemIds = [
    ...new Set([
      ...(recentPoems ?? []).map((p) => p.id),
      ...(featuredPoems ?? []).map((p) => p.id),
    ]),
  ];
  const [favIds, favoriteCounts] = await Promise.all([
    getFavoritePoemIds(allPoemIds),
    getFavoriteCounts(allPoemIds),
  ]);

  const getCategoryLabel = (cat: CategoryRecord) => {
    if (locale === "am") return cat.name_am || cat.name_en || "";
    return cat.name_en || cat.name_am || "";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="-mx-4 mb-12 border-y border-border bg-accent px-4 py-8 text-center sm:mx-0 sm:rounded-lg sm:border">
        <h1 className="mb-2 text-2xl font-semibold tracking-normal text-foreground">
          {tHome("heroTitle")}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-secondary">
          {tHome("heroSubtitle")}
        </p>
        <div className="mx-auto mt-6 max-w-2xl text-left">
          <UniversalSearch categories={categories} />
          <div className="mt-4 flex justify-center">
            <PostPoemAction />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">{tHome("recentPoems")}</h2>
          <Link href="/poems" className="text-sm underline">
            {tHome("browsePoems")}
          </Link>
        </div>
        {recentPoems && recentPoems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPoems.map((poem) => {
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
            title={tHome("noPoemsTitle")}
            description={tHome("noPoemsDesc")}
          />
        )}
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">{tHome("featuredPoems")}</h2>
          <Link href="/poems" className="text-sm underline">
            {tHome("browsePoems")}
          </Link>
        </div>
        {featuredPoems && featuredPoems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPoems.map((poem) => (
              <PoemCard
                key={poem.id}
                poem={{
                  ...poem,
                  categoryName:
                    locale === "am"
                      ? poem.category_name_am || poem.category_name_en
                      : poem.category_name_en || poem.category_name_am,
                  poetName: poem.poet_name_am ?? poem.poet_name_en,
                }}
                favorited={favIds.has(poem.id)}
                favoriteCount={Number(poem.favorite_count ?? 0)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={tHome("noPoemsTitle")}
            description={tHome("noPoemsDesc")}
          />
        )}
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">
            {tHome("discoverByCategory")}
          </h2>
          <Link href="/poems" className="text-sm underline">
            {tHome("browsePoems")}
          </Link>
        </div>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/poems?category=${category.id}`}>
                <Badge
                  variant="outline"
                  className="h-auto cursor-pointer rounded-lg px-4 py-2 text-sm hover:bg-accent"
                >
                  {getCategoryLabel(category)}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={tHome("noCategoriesTitle")}
            description={tHome("noCategoriesDesc")}
          />
        )}
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">{tHome("featuredPoets")}</h2>
          <Link href="/poets" className="text-sm underline">
            {tHome("viewAllPoets")}
          </Link>
        </div>
        {featuredPoets && featuredPoets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPoets.map((poet) => (
              <Link
                key={poet.id}
                href={`/poets/${poet.id}`}
                className="content-card rounded-lg border border-border bg-card p-4"
              >
                <div className="font-semibold">{poet.name_am}</div>
                {poet.name_en ? (
                  <div className="text-sm text-muted-foreground">
                    {poet.name_en}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {tPoets("poemCount", { count: poet.poem_count })}
                  </Badge>
                  <Badge variant="outline">
                    {tPoets("likeCount", { count: poet.favorite_count })}
                  </Badge>
                  {poet.poem_count > 0 &&
                  poet.liked_poem_count !== undefined ? (
                    <Badge variant="secondary">
                      {tPoets("likeRate", {
                        rate: Math.round(
                          (poet.liked_poem_count / poet.poem_count) * 100,
                        ),
                      })}
                    </Badge>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={tPoets("noPoetsTitle")}
            description={tPoets("noPoetsDesc")}
          />
        )}
      </section>
    </div>
  );
}
