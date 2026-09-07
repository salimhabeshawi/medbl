import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getCurrentUser, getFavoritePoemIds } from "@/lib/favorites";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: recentPoems }, { data: featuredPoets }] = await Promise.all([
    supabase
      .from("poems")
      .select(
        "id, title, attribution_status, category, tags, poet_id, poets(name_am, name_en), created_at"
      )
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
      <section className="-mx-4 mb-12 border-y border-border bg-accent px-4 py-8 text-center sm:mx-0 sm:rounded-lg sm:border">
        <h1 className="mb-2 text-2xl font-semibold tracking-normal text-foreground">
          A living anthology of Amharic poetry
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-secondary">
          Read, favorite, and contribute verses from poets past and present.
        </p>
        <div className="mx-auto mt-6 max-w-2xl text-left"><UniversalSearch /></div>
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
              const tags = Array.isArray(poem.tags) ? poem.tags.slice(0, 3) : [];

              return (
                <Card
                  key={poem.id}
                  className="border border-border bg-card shadow-none transition hover:border-primary/50 hover:bg-accent/40"
                >
                  <CardHeader>
                    <CardTitle className="font-sans text-base text-foreground">
                      <Link href={`/poems/${poem.id}`} className="hover:text-primary">
                        {poem.title}
                      </Link>
                    </CardTitle>
                    {user ? (
                      <CardAction>
                        <FavoriteToggle
                          poemId={poem.id}
                          initialFavorited={favIds.has(poem.id)}
                        />
                      </CardAction>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {poet ? (
                      <p className="text-sm text-secondary">
                        by {poet.name_am ?? poet.name_en}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {poem.attribution_status === "disputed" ? (
                        <DisputedTag />
                      ) : (
                        <Badge
                          variant={
                            poem.attribution_status === "verified"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {poem.attribution_status}
                        </Badge>
                      )}
                      {poem.category ? (
                        <Badge variant="outline">{poem.category}</Badge>
                      ) : null}
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No poems published yet" description="The anthology is waiting for its next voice." />
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
                className="rounded-lg border border-border bg-card p-4 transition hover:border-primary/50 hover:bg-accent/40"
              >
                <div className="font-semibold">{poet.name_am}</div>
                {poet.name_en ? (
                  <div className="text-sm text-muted-foreground">{poet.name_en}</div>
                ) : null}
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
