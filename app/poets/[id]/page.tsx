import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getFavoriteCounts, getFavoritePoemIds } from "@/lib/favorites";
import { EmptyState } from "@/components/empty-state";
import { PoemCard } from "@/components/poem-card";
import { BackLink } from "@/components/back-link";
import { getTranslations } from "next-intl/server";
import { firstRelation } from "@/lib/relations";
import { formatStoredGcYearDisplay } from "@/lib/calendar";

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
  const tPoets = await getTranslations("Poets");
  const tCommon = await getTranslations("Common");

  const { data: poet, error } = await supabase
    .from("poets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !poet) notFound();

  const { data: poems } = await supabase
    .from("poems")
    .select("id, title, body, category_id, categories(id, name_am, name_en), tags, attribution_status, poem_number, view_count, created_at")
    .eq("poet_id", id)
    .order("created_at", { ascending: false });

  let years: string | null = null;
  if (poet.birth_year && poet.death_year) {
    years = `${formatStoredGcYearDisplay(poet.birth_year)} – ${formatStoredGcYearDisplay(poet.death_year)}`;
  } else if (poet.birth_year) {
    years = `${formatStoredGcYearDisplay(poet.birth_year)}`;
  } else if (poet.death_year) {
    years = `? – ${formatStoredGcYearDisplay(poet.death_year)}`;
  }

  const user = await getCurrentUser();
  const favIds = await getFavoritePoemIds((poems ?? []).map((p) => p.id));
  const favoriteCounts = await getFavoriteCounts((poems ?? []).map((p) => p.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackLink href="/poets">{tCommon("backToPoets")}</BackLink>
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
        <h2 className="mb-4 text-2xl font-semibold">{tCommon("poems")}</h2>
        {poems && poems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {poems.map((poem) => {
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
                    poetName: poet.name_am ?? poet.name_en,
                    viewCount: poem.view_count ?? 0,
                  }}
                  favorited={favIds.has(poem.id)}
                  favoriteCount={favoriteCounts.get(poem.id) ?? 0}
                  showFavorite={Boolean(user)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState title={tPoets("noPublishedPoems")} description={tPoets("noPublishedPoemsDesc")} />
        )}
      </section>
    </div>
  );
}