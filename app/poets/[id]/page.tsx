import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentUser,
  getFavoriteCounts,
  getFavoritePoemIds,
} from "@/lib/favorites";
import { EmptyState } from "@/components/empty-state";
import { PoemCard } from "@/components/poem-card";
import { BackLink } from "@/components/back-link";
import { Ornament } from "@/components/manuscript/ornament";
import { PoetSeal } from "@/components/manuscript/poet-seal";
import { SectionHeader } from "@/components/manuscript/section-header";
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
    .select(
      "id, title, body, category_id, categories(id, name_am, name_en), tags, attribution_status, poem_number, view_count, created_at",
    )
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
  const favoriteCounts = await getFavoriteCounts(
    (poems ?? []).map((p) => p.id),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <BackLink fallbackHref="/poets">{tCommon("backToPoets")}</BackLink>
      <header className="manuscript-sheet flex flex-col items-center px-5 py-10 text-center sm:px-12 sm:py-14">
        <PoetSeal name={poet.name_am} size="lg" />
        <h1 className="mt-5 text-balance font-serif text-3xl font-semibold leading-tight sm:text-5xl">
          {poet.name_am}
        </h1>
        {poet.name_en ? (
          <p className="mt-2 text-muted-foreground">{poet.name_en}</p>
        ) : null}
        {years ? (
          <p className="mt-1 text-sm text-secondary">{years}</p>
        ) : null}
        {poet.bio ? (
          <>
            <Ornament className="mx-auto my-6 w-full max-w-48" />
            <p className="max-w-2xl whitespace-pre-line text-base leading-8 text-foreground/80">
              {poet.bio}
            </p>
          </>
        ) : null}
      </header>

      <section className="mt-14" aria-labelledby="poet-poems">
        <SectionHeader id="poet-poems" title={tCommon("poems")} />
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
          <EmptyState
            title={tPoets("noPublishedPoems")}
            description={tPoets("noPublishedPoemsDesc")}
          />
        )}
      </section>
    </div>
  );
}
