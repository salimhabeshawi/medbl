import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getFavoriteCounts, getFavoritePoemIds } from "@/lib/favorites";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BackLink } from "@/components/back-link";
import { getLocale, getTranslations } from "next-intl/server";
import { firstRelation } from "@/lib/relations";

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
  const locale = await getLocale();
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
    .select("id, title, body, category_id, categories(name_am, name_en), attribution_status, created_at")
    .eq("poet_id", id)
    .order("created_at", { ascending: false });

  const years =
    poet.birth_year || poet.death_year
      ? `${poet.birth_year ?? "?"} – ${poet.death_year ?? "?"}`
      : null;

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
          <div className="grid gap-4 sm:grid-cols-2">
            {poems.map((poem) => (
              <Card
                key={poem.id}
                className="content-card relative border-primary/15 shadow-sm"
              >
                <Link href={`/poems/${poem.id}`} className="absolute inset-0 z-0 rounded-xl" aria-label={`Open ${poem.title}`} />
                <CardContent className="relative z-10 flex items-center justify-between gap-4 p-5"><div className="pointer-events-none min-w-0">
                  <Link
                    href={`/poems/${poem.id}`}
                    className="font-medium hover:underline"
                  >
                    {poem.title}
                  </Link>
                  {poem.attribution_status === "disputed" ? (
                    <DisputedTag />
                  ) : null}
                  {firstRelation<{ name_am: string | null; name_en: string | null }>(poem.categories) ? (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {(() => { const category = firstRelation<{ name_am: string | null; name_en: string | null }>(poem.categories); return locale === "am" ? category?.name_am || category?.name_en : category?.name_en || category?.name_am; })()}
                    </span>
                  ) : null}
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{poem.body.split(/\r?\n/).slice(0, 4).join("\n").trim()}</p>
                </div>
                {user ? (
                  <span className="relative z-10 pointer-events-auto"><FavoriteToggle
                    poemId={poem.id}
                    initialFavorited={favIds.has(poem.id)}
                    initialFavoriteCount={favoriteCounts.get(poem.id) ?? 0}
                  /></span>
                ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title={tPoets("noPublishedPoems")} description={tPoets("noPublishedPoemsDesc")} />
        )}
      </section>
    </div>
  );
}