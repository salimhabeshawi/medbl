import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getCurrentUser, getFavoritePoemIds } from "@/lib/favorites";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: recentPoems }, { data: featuredPoets }] = await Promise.all([
    supabase
      .from("poems")
      .select("id, title, attribution_status, poet_id, poets(name_am, name_en), created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("poets")
      .select("id, name_am, name_en")
      .eq("verified", true)
      .order("name_am")
      .limit(6),
  ]);

  const user = await getCurrentUser();
  const favIds = await getFavoritePoemIds((recentPoems ?? []).map((p) => p.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Medbl</h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          የአማርኛ ግጥም መድረክ — browse poets and poems, search the archive, and
          discover Amharic poetry.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/poems"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Browse poems
          </Link>
          <Link
            href="/poets"
            className="rounded-md border px-4 py-2 text-sm font-semibold transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Browse poets
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Recently added poems</h2>
          <Link href="/poems" className="text-sm underline">
            View all
          </Link>
        </div>
        {recentPoems && recentPoems.length > 0 ? (
          <ul className="divide-y">
            {recentPoems.map((poem) => {
              const poet = firstRelation<{
                name_am: string;
                name_en: string;
              }>(poem.poets);
              return (
                <li
                  key={poem.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/poems/${poem.id}`}
                      className="font-medium hover:underline"
                    >
                      {poem.title}
                    </Link>
                    {poem.attribution_status === "disputed" ? (
                      <DisputedTag />
                    ) : null}
                    {poet ? (
                      <span className="text-sm text-zinc-500">
                        {" "}
                        — {poet.name_am ?? poet.name_en}
                      </span>
                    ) : null}
                  </div>
                  {user ? (
                    <FavoriteToggle
                      poemId={poem.id}
                      initialFavorited={favIds.has(poem.id)}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-zinc-500">
            No poems published yet.
          </p>
        )}
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
                className="rounded-lg border p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div className="font-semibold">{poet.name_am}</div>
                {poet.name_en ? (
                  <div className="text-sm text-zinc-500">{poet.name_en}</div>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-zinc-500">
            No featured poets yet.
          </p>
        )}
      </section>
    </div>
  );
}