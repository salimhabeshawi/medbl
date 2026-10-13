import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getFavoriteCounts, getFavoritePoemIds } from "@/lib/favorites";
import { Badge } from "@/components/ui/badge";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { PoemCard } from "@/components/poem-card";
import { PostPoemAction } from "@/components/post-poem-action";
import { getLocale, getTranslations } from "next-intl/server";
import { HomeLoading } from "@/components/home-loading";
import { Ornament } from "@/components/manuscript/ornament";
import { SectionHeader } from "@/components/manuscript/section-header";
import { PoetCard } from "@/components/poet-card";

type FeaturedPoet = {
  id: string;
  name_am: string;
  name_en: string | null;
  /** Published poems, disputed ones INCLUDED (see get_featured_poets). */
  poem_count: number;
  /** Poems with ≥ 1 favourite, disputed ones included. */
  liked_poem_count?: number;
  /** Favourites across ALL of the poet's poems, disputed ones included. */
  favorite_count: number;
  /** favorite_count / poem_count as a raw average (e.g. 3.2), or null when
   *  the poet has fewer than MIN_POEMS_FOR_AVG_LIKES poems. */
  avg_likes_per_poem: number | null;
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
  poem_number?: number | null;
  favorite_count: number;
  view_count?: number | null;
};

type CategoryRecord = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

// How many most-favorited poems the home page's "Featured poems" section shows.
// get_featured_poems() also excludes disputed poems (see AGENTS.md), so fewer
// rows can come back when a favorite has been disputed.
const FEATURED_POEMS_LIMIT = 5;

// Minimum number of published poems before a poet card shows an
// "avg. likes/poem" figure — an average over a single poem is that poem's like
// count, not an average. Mirrors v_avg_likes_min_poems in
// get_featured_poets(), which already returns null below the threshold; this is
// a defensive display guard (and the only gate on the no-RPC fallback below,
// which has no favourites data and therefore never produces a figure).
// Judgment call — raise it as the collection grows.
const MIN_POEMS_FOR_AVG_LIKES = 2;

async function getFeaturedPoets(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<FeaturedPoet[]> {
  const { data, error } = await supabase.rpc("get_featured_poets", {
    p_limit: 5,
  });
  if (!error && data) return data as FeaturedPoet[];

  // Fallback for when the RPC is unavailable. Like get_featured_poets, this
  // counts disputed poems too (they stay publicly visible), so the two paths
  // report the same poem_count. Favourite counts aren't reachable without the
  // RPC, so they stay 0 and no average is shown.
  const { data: poems } = await supabase
    .from("poems")
    .select("poet_id, poets(id, name_am, name_en)");

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
      avg_likes_per_poem: null,
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

export default function Home() {
  return (
    <>
      <Suspense fallback={<HomeLoading />}>
        <HomeContent />
      </Suspense>
    </>
  );
}

async function HomeContent() {
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
        "id, title, body, attribution_status, poem_number, view_count, category_id, categories(id, name_am, name_en), tags, poet_id, poets(name_am, name_en), created_at",
      )
      .order("created_at", { ascending: false })
      .limit(6),
    getFeaturedPoets(supabase),
    supabase.rpc("get_featured_poems", { p_limit: FEATURED_POEMS_LIMIT }),
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="manuscript-sheet mb-14 px-5 py-10 text-center sm:px-10 sm:py-14">
        <h1 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {tHome("heroTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-secondary sm:text-base">
          {tHome("heroSubtitle")}
        </p>
        <Ornament className="mx-auto my-6 max-w-48" />
        <div className="mx-auto max-w-2xl text-left">
          <UniversalSearch categories={categories} />
          <div className="mt-4 flex justify-center">
            <PostPoemAction />
          </div>
        </div>
      </section>

      <section className="mb-14" aria-labelledby="recent-poems">
        <SectionHeader
          id="recent-poems"
          title={tHome("recentPoems")}
          href="/poems"
          linkLabel={tHome("browsePoems")}
        />
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
                    poemNumber: poem.poem_number,
                    category: catRelation,
                    poetName: poet?.name_am ?? poet?.name_en,
                    viewCount: poem.view_count ?? 0,
                  }}
                  favorited={favIds.has(poem.id)}
                  favoriteCount={favoriteCounts.get(poem.id) ?? 0}
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

      <section className="mb-14" aria-labelledby="featured-poems">
        <SectionHeader
          id="featured-poems"
          title={tHome("featuredPoems")}
          href="/poems"
          linkLabel={tHome("browsePoems")}
        />
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
                  poemNumber: poem.poem_number,
                  poetName: poem.poet_name_am ?? poem.poet_name_en,
                  viewCount: Number(poem.view_count ?? 0),
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

      <section className="mb-14" aria-labelledby="discover-by-category">
        <SectionHeader
          id="discover-by-category"
          title={tHome("discoverByCategory")}
          href="/poems"
          linkLabel={tHome("browsePoems")}
        />
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/poems?category=${category.id}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-accent hover:text-primary active:scale-[0.97] motion-reduce:active:scale-100"
              >
                {getCategoryLabel(category)}
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

      <section aria-labelledby="featured-poets">
        <SectionHeader
          id="featured-poets"
          title={tHome("featuredPoets")}
          href="/poets"
          linkLabel={tHome("viewAllPoets")}
        />
        {featuredPoets && featuredPoets.length > 0 ? (
          // Phones: a swipeable row that peeks the next card; wider screens:
          // the usual grid.
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {featuredPoets.map((poet) => (
              <div
                key={poet.id}
                className="w-[78%] shrink-0 snap-start sm:w-auto"
              >
                <PoetCard
                  id={poet.id}
                  nameAm={poet.name_am}
                  nameEn={poet.name_en}
                >
                  <Badge variant="outline">
                    {tPoets("poemCount", { count: poet.poem_count })}
                  </Badge>
                  <Badge variant="outline">
                    {tPoets("likeCount", { count: poet.favorite_count })}
                  </Badge>
                  {poet.poem_count >= MIN_POEMS_FOR_AVG_LIKES &&
                  poet.avg_likes_per_poem !== null &&
                  poet.avg_likes_per_poem !== undefined ? (
                    // Raw average, e.g. 3.2. Hidden (not "—") below the
                    // threshold: a placeholder badge next to two real counts
                    // reads as broken data rather than "not enough poems yet".
                    <Badge variant="secondary">
                      {tPoets("avgLikesPerPoem", {
                        value: Number(poet.avg_likes_per_poem).toFixed(1),
                      })}
                    </Badge>
                  ) : null}
                </PoetCard>
              </div>
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
