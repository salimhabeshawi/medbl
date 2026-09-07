import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getCurrentUser, getFavoriteCounts, getFavoritePoemIds } from "@/lib/favorites";
import { Badge } from "@/components/ui/badge";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { PoemCard } from "@/components/poem-card";
import { PostPoemAction } from "@/components/post-poem-action";

type FeaturedPoet = {
  id: string;
  name_am: string;
  name_en: string | null;
  poem_count: number;
  favorite_count: number;
  favorites_per_poem: number;
  favorites_per_poem_percent?: number;
};

type FeaturedPoem = {
  id: string;
  title: string;
  body: string;
  poet_name_am: string;
  poet_name_en: string | null;
  favorite_count: number;
};

async function getFeaturedPoets(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<FeaturedPoet[]> {
  const { data, error } = await supabase.rpc("get_featured_poets", {
    p_limit: 5,
  });
  if (!error && data) return data as FeaturedPoet[];

  // Keep the section useful while a newly applied function waits for the
  // Supabase schema cache to refresh. The full weighted ranking is used as
  // soon as the RPC is available.
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
      favorite_count: 0,
      favorites_per_poem: 0,
    };
    current.poem_count += 1;
    byPoet.set(row.poet_id, current);
  }

  return [...byPoet.values()]
    .sort((a, b) => b.poem_count - a.poem_count || a.name_am.localeCompare(b.name_am))
    .slice(0, 5);
}

export default async function Home() {
  const supabase = await createClient();

  const [{ data: recentPoems }, featuredPoets, { data: featuredPoemRows }, { data: categoryRows }, { data: tagRows }] = await Promise.all([
    supabase
      .from("poems")
      .select(
        "id, title, body, attribution_status, category, tags, poet_id, poets(name_am, name_en), created_at"
      )
      .order("created_at", { ascending: false })
      .limit(6),
    getFeaturedPoets(supabase),
    supabase.rpc("get_featured_poems", { p_limit: 5 }),
    supabase.from("categories").select("name").order("name"),
    supabase.from("poems").select("tags").neq("attribution_status", "disputed"),
  ]);
  const featuredPoems = (featuredPoemRows ?? []) as FeaturedPoem[];
  const categories = (categoryRows ?? []).map((row) => row.name);
  const tags = [...new Set((tagRows ?? []).flatMap((row) => Array.isArray(row.tags) ? row.tags : []))].sort();

  const user = await getCurrentUser();
  const allPoemIds = [
    ...(recentPoems ?? []).map((p) => p.id),
    ...(featuredPoems ?? []).map((p) => p.id),
  ];
  const [favIds, favoriteCounts] = await Promise.all([
    getFavoritePoemIds(allPoemIds),
    getFavoriteCounts(allPoemIds),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="-mx-4 mb-12 border-y border-border bg-accent px-4 py-8 text-center sm:mx-0 sm:rounded-lg sm:border">
        <h1 className="mb-2 text-2xl font-semibold tracking-normal text-foreground">
          A living anthology of Amharic poetry
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-secondary">
          Read, favorite, and contribute verses from poets past and present.
        </p>
        <div className="mx-auto mt-6 max-w-2xl text-left"><UniversalSearch categories={categories} /><div className="mt-4 flex justify-center"><PostPoemAction /></div></div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Recently added poems</h2>
          <Link href="/poems" className="text-sm underline">
            View all
          </Link>
        </div>
        {recentPoems && recentPoems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPoems.map((poem) => {
              const poet = firstRelation<{
                name_am: string;
                name_en: string;
              }>(poem.poets);
              return <PoemCard key={poem.id} poem={{ ...poem, poetName: poet?.name_am ?? poet?.name_en }} favorited={favIds.has(poem.id)} favoriteCount={favoriteCounts.get(poem.id) ?? 0} showFavorite={Boolean(user)} />;
            })}
          </div>
        ) : (
          <EmptyState title="No poems published yet" description="The anthology is waiting for its next voice." />
        )}
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between"><h2 className="text-2xl font-semibold">Featured poems</h2><Link href="/poems" className="text-sm underline">View all</Link></div>
        {featuredPoems && featuredPoems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPoems.map((poem) => <PoemCard key={poem.id} poem={{ ...poem, poetName: poem.poet_name_am ?? poem.poet_name_en }} favorited={favIds.has(poem.id)} favoriteCount={Number(poem.favorite_count ?? 0)} />)}
          </div>
        ) : <EmptyState title="No featured poems yet" description="The most loved poems will appear here." />}
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between"><h2 className="text-2xl font-semibold">Discover by category</h2><Link href="/poems" className="text-sm underline">Browse poems</Link></div>
        {categories.length > 0 ? <div className="flex flex-wrap gap-3">{categories.map((category) => <Link key={category} href={`/poems?category=${encodeURIComponent(category)}`}><Badge variant="outline" className="h-auto cursor-pointer rounded-lg px-4 py-2 text-sm hover:bg-accent">{category}</Badge></Link>)}</div> : <EmptyState title="No categories yet" description="Categories will appear here as moderators add them." />}
      </section>
      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between"><h2 className="text-2xl font-semibold">Discover by tag</h2><Link href="/poems" className="text-sm underline">Browse poems</Link></div>
        {tags.length > 0 ? <div className="flex flex-wrap gap-3">{tags.map((tag) => <Link key={tag} href={`/poems?tag=${encodeURIComponent(tag)}`}><Badge variant="secondary" className="h-auto cursor-pointer rounded-full px-4 py-2 text-sm hover:bg-secondary/80">#{tag}</Badge></Link>)}</div> : <EmptyState title="No tags yet" description="Tags will appear here as poems are added." />}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Featured poets</h2>
          <Link href="/poets" className="text-sm underline">
            View all
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
                  <div className="text-sm text-muted-foreground">{poet.name_en}</div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{poet.poem_count} poems</Badge>
                  <Badge variant="secondary">
                    {(poet.favorites_per_poem_percent ?? 0).toFixed(0)}% liked
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No featured poets yet" description="The registry will appear here as poets are verified." />
        )}
      </section>
    </div>
  );
}
