import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getFavoritePoemIds } from "@/lib/favorites";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: poet } = await supabase
    .from("poets")
    .select("name_am")
    .eq("id", id)
    .single();
  return { title: poet?.name_am ?? "Poet" };
}

export default async function PoetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: poet, error } = await supabase
    .from("poets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !poet) notFound();

  const { data: poems } = await supabase
    .from("poems")
    .select("id, title, category, attribution_status, created_at")
    .eq("poet_id", id)
    .order("created_at", { ascending: false });

  const years =
    poet.birth_year || poet.death_year
      ? `${poet.birth_year ?? "?"} – ${poet.death_year ?? "?"}`
      : null;

  const user = await getCurrentUser();
  const favIds = await getFavoritePoemIds((poems ?? []).map((p) => p.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 text-3xl font-bold">{poet.name_am}</h1>
      {poet.name_en ? (
        <p className="text-muted-foreground">{poet.name_en}</p>
      ) : null}
      {years ? <p className="mt-1 text-sm text-muted-foreground">{years}</p> : null}

      {poet.bio ? (
        <p className="mt-6 whitespace-pre-line leading-7 text-muted-foreground">
          {poet.bio}
        </p>
      ) : null}

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold">Poems</h2>
        {poems && poems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {poems.map((poem) => (
              <Card
                key={poem.id}
                className="border-primary/15 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:bg-accent/40 hover:shadow-lg"
              >
                <CardContent className="flex items-center justify-between gap-4 p-5"><div className="min-w-0">
                  <Link
                    href={`/poems/${poem.id}`}
                    className="font-medium hover:underline"
                  >
                    {poem.title}
                  </Link>
                  {poem.attribution_status === "disputed" ? (
                    <DisputedTag />
                  ) : null}
                  {poem.category ? (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {poem.category}
                    </span>
                  ) : null}
                </div>
                {user ? (
                  <FavoriteToggle
                    poemId={poem.id}
                    initialFavorited={favIds.has(poem.id)}
                  />
                ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No published poems yet" description="This poet does not have any published poems in the anthology." />
        )}
      </section>
    </div>
  );
}