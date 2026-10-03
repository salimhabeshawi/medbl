import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getFavoriteCounts } from "@/lib/favorites";
import { PoemActions } from "@/components/poem-actions";
import { ReportPoem } from "@/components/report-poem";
import { AttributionBadge } from "@/components/attribution-badge";
import { PoemCard } from "@/components/poem-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BackLink } from "@/components/back-link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

type CategoryRelation = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

type PoetRelation = {
  id: string;
  name_am: string;
  name_en: string | null;
};

type RecommendationRpcRow = {
  id: string;
};

type RecommendedPoem = {
  id: string;
  title: string;
  body: string;
  category_id: string | null;
  categories: CategoryRelation | CategoryRelation[] | null;
  tags: string[] | null;
  attribution_status: string;
  poet_id: string;
  poets: PoetRelation | PoetRelation[] | null;
  poem_number: number;
  view_count: number;
};

type AdjacentPoems = {
  prev_id: string | null;
  prev_number: number | null;
  prev_title: string | null;
  next_id: string | null;
  next_number: number | null;
  next_title: string | null;
  total_poems: number;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: poem } = await supabase
    .from("poems")
    .select("title")
    .eq("id", id)
    .single();
  return { title: poem?.title ?? "Poem" };
}

export default async function PoemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Count this page load as a view — server-side, once per request, before the
  // poem data is fetched so the displayed count already includes this visit.
  // Refreshes count again by design; list/card contexts never call this.
  await supabase.rpc("increment_poem_view", { p_poem_id: id });

  const { data: poem, error } = await supabase
    .from("poems")
    .select(
      "id, title, body, category_id, categories(id, name_am, name_en), tags, attribution_status, poem_number, view_count, source, created_at, poets(id, name_am, name_en)",
    )
    .eq("id", id)
    .single();

  if (error || !poem) notFound();

  const locale = await getLocale();
  const tPoems = await getTranslations("Poems");
  const tCommon = await getTranslations("Common");

  const poet = firstRelation<{
    id: string;
    name_am: string;
    name_en: string;
  }>(poem.poets);

  const category = firstRelation<{
    id: string;
    name_am: string | null;
    name_en: string | null;
  }>(poem.categories);

  const categoryLabel = category
    ? locale === "am"
      ? category.name_am || category.name_en
      : category.name_en || category.name_am
    : null;

  const [
    { data: sameCategoryRows },
    { data: samePoetRows },
    { data: adjacentRow },
  ] = await Promise.all([
    category
      ? supabase.rpc("get_recommended_same_category", {
          p_poem_id: id,
          p_limit: 3,
        })
      : Promise.resolve({ data: [] }),
    supabase.rpc("get_recommended_same_poet", {
      p_poem_id: id,
      p_limit: 3,
    }),
    supabase.rpc("get_adjacent_poems", { p_poem_id: id }),
  ]);

  const categoryRecommendationRows = (sameCategoryRows ??
    []) as RecommendationRpcRow[];
  const poetRecommendationRows = (samePoetRows ?? []) as RecommendationRpcRow[];
  const recommendationIds = [
    ...new Set(
      [...categoryRecommendationRows, ...poetRecommendationRows].map(
        (recommendation) => recommendation.id,
      ),
    ),
  ];
  const { data: recommendationDetails } = recommendationIds.length
    ? await supabase
        .from("poems")
        .select(
          "id, title, body, category_id, categories(id, name_am, name_en), tags, attribution_status, poet_id, poets(id, name_am, name_en), poem_number, view_count",
        )
        .in("id", recommendationIds)
    : { data: [] };
  const detailsById = new Map(
    ((recommendationDetails ?? []) as RecommendedPoem[]).map(
      (recommendation) => [recommendation.id, recommendation],
    ),
  );
  const recommendedCategoryPoems = categoryRecommendationRows
    .map((row) => detailsById.get(row.id))
    .filter((row): row is RecommendedPoem => Boolean(row));
  const recommendedPoetPoems = poetRecommendationRows
    .map((row) => detailsById.get(row.id))
    .filter((row): row is RecommendedPoem => Boolean(row));
  const adjacent = (adjacentRow?.[0] ?? null) as AdjacentPoems | null;

  const publishedDate = new Intl.DateTimeFormat(
    locale === "am" ? "am-ET" : "en-US",
    { dateStyle: "medium", timeZone: "Africa/Addis_Ababa" },
  ).format(new Date(poem.created_at));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialFavorited = false;
  let alreadyReported = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("poem_id", id)
      .maybeSingle();
    initialFavorited = Boolean(fav);

    const { data: hasOpenReport } = await supabase.rpc("has_open_report", {
      p_poem_id: id,
    });
    alreadyReported = Boolean(hasOpenReport);
  }

  const allRecommendationIds = [
    ...recommendedCategoryPoems.map((recommendation) => recommendation.id),
    ...recommendedPoetPoems.map((recommendation) => recommendation.id),
  ];
  const [
    favoriteCounts,
    recommendationFavoriteCounts,
    recommendationFavorites,
  ] = await Promise.all([
    getFavoriteCounts([poem.id]),
    getFavoriteCounts(allRecommendationIds),
    user
      ? supabase
          .from("favorites")
          .select("poem_id")
          .eq("user_id", user.id)
          .in("poem_id", allRecommendationIds)
      : Promise.resolve({ data: [] }),
  ]);
  const recommendationFavoriteIds = new Set(
    (recommendationFavorites.data ?? []).map((favorite) => favorite.poem_id),
  );

  const recommendationCard = (recommendation: RecommendedPoem) => {
    const recommendationPoet = firstRelation<PoetRelation>(
      recommendation.poets,
    );
    const recommendationCategory = firstRelation<CategoryRelation>(
      recommendation.categories,
    );
    return (
      <PoemCard
        key={recommendation.id}
        poem={{
          ...recommendation,
          category: recommendationCategory,
          poetName: recommendationPoet?.name_am ?? recommendationPoet?.name_en,
          poemNumber: recommendation.poem_number,
          viewCount: recommendation.view_count ?? 0,
        }}
        favorited={recommendationFavoriteIds.has(recommendation.id)}
        favoriteCount={recommendationFavoriteCounts.get(recommendation.id) ?? 0}
        showFavorite={Boolean(user)}
        showFavoriteCount
      />
    );
  };

  const hasRecommendedCategory =
    recommendedCategoryPoems.length > 0 && Boolean(categoryLabel);
  const hasRecommendedPoet =
    recommendedPoetPoems.length > 0 && Boolean(poet?.name_am);

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <BackLink fallbackHref="/poems">{tCommon("back")}</BackLink>
      <Card className="border border-border bg-card shadow-none">
        <CardHeader className="gap-5 border-b border-border bg-accent/45 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {/* The detail number matches poem cards, scaled up for emphasis. */}
              {typeof poem.poem_number === "number" ? (
                <p
                  className="mb-2 font-bold tabular-nums text-4xl leading-none text-muted-foreground sm:text-5xl"
                  aria-label={`#${poem.poem_number}`}
                >
                  #{poem.poem_number}
                </p>
              ) : null}
              <CardTitle className="mb-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {poem.title}
              </CardTitle>
              {poet?.name_am || poet?.name_en ? (
                <p className="text-sm text-secondary">
                  {tPoems("submittedBy")}{" "}
                  <Link
                    href={`/poets/${poet.id}`}
                    className="font-medium underline underline-offset-4 hover:text-primary"
                  >
                    {poet.name_am ?? poet.name_en}
                  </Link>
                </p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {tPoems("publishedOn")}: {publishedDate}
              </p>
            </div>
            <PoemActions
              poemId={poem.id}
              title={poem.title}
              body={poem.body}
              poetNameAm={poet?.name_am ?? ""}
              initialFavorited={initialFavorited}
              initialFavoriteCount={favoriteCounts.get(poem.id) ?? 0}
              canFavorite={Boolean(user)}
              viewCount={poem.view_count ?? 0}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <AttributionBadge status={poem.attribution_status} />
            {category && categoryLabel ? (
              <Badge asChild variant="outline">
                <Link href={`/poems?category=${category.id}`}>
                  {categoryLabel}
                </Link>
              </Badge>
            ) : null}
            {Array.isArray(poem.tags)
              ? poem.tags.map((tag: string) => (
                  <Badge key={tag} asChild variant="outline">
                    <Link href={`/poems?tag=${encodeURIComponent(tag)}`}>
                      #{tag}
                    </Link>
                  </Badge>
                ))
              : null}
          </div>
          {poem.attribution_status === "disputed" ? (
            <p className="text-xs text-destructive">
              {tPoems("disputedNotice")}
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="whitespace-pre-wrap text-center text-lg leading-9 text-foreground">
            {poem.body}
          </div>

          <Separator className="my-8" />

          {poem.source ? (
            <p className="text-xs text-muted-foreground">
              {tPoems("source")}: {poem.source}
            </p>
          ) : null}

          <div className="mt-4">
            {user ? (
              <ReportPoem poemId={poem.id} alreadyReported={alreadyReported} />
            ) : (
              <p className="text-xs text-muted-foreground">
                <Link href="/login" className="underline hover:text-primary">
                  {tPoems("loginToReport")}
                </Link>{" "}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {adjacent && adjacent.total_poems > 1 ? (
        <nav
          aria-label={`${tCommon("previous")} / ${tCommon("next")}`}
          className="mt-6 grid grid-cols-2 gap-3 py-2 sm:mt-8"
        >
          {adjacent.prev_id ? (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto min-h-16 w-full min-w-0 justify-start whitespace-normal border-border bg-muted/40 px-2 py-3 text-left hover:border-primary hover:bg-accent focus-visible:border-primary sm:min-h-20 sm:px-5"
            >
              <Link href={`/poems/${adjacent.prev_id}`}>
                <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <ChevronLeft
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {tCommon("previous")}
                  </span>
                  <span className="line-clamp-2 w-full text-sm font-semibold text-foreground sm:text-base">
                    #{adjacent.prev_number} · {adjacent.prev_title}
                  </span>
                </span>
              </Link>
            </Button>
          ) : null}
          {adjacent.next_id ? (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto min-h-16 w-full min-w-0 justify-end whitespace-normal border-border bg-muted/40 px-2 py-3 text-right hover:border-primary hover:bg-accent focus-visible:border-primary sm:min-h-20 sm:px-5"
            >
              <Link href={`/poems/${adjacent.next_id}`}>
                <span className="flex min-w-0 flex-1 flex-col items-end gap-1">
                  <span className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
                    {tCommon("next")}
                    <ChevronRight
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="line-clamp-2 w-full text-sm font-semibold text-foreground sm:text-base">
                    #{adjacent.next_number} · {adjacent.next_title}
                  </span>
                </span>
              </Link>
            </Button>
          ) : null}
        </nav>
      ) : null}

      {hasRecommendedCategory || hasRecommendedPoet ? (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold">
            {tPoems("recommendedReads")}
          </h2>
          {hasRecommendedCategory ? (
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold">
                {tPoems("moreInCategory", { category: categoryLabel ?? "" })}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedCategoryPoems.map(recommendationCard)}
              </div>
            </div>
          ) : null}
          {hasRecommendedPoet ? (
            <div>
              <h3 className="mb-4 text-xl font-semibold">
                {tPoems("moreByPoet", { poet: poet?.name_am ?? "" })}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedPoetPoems.map(recommendationCard)}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
