import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getFavoriteCounts } from "@/lib/favorites";
import { PoemActions } from "@/components/poem-actions";
import { ReportPoem } from "@/components/report-poem";
import { AttributionBadge } from "@/components/attribution-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BackLink } from "@/components/back-link";
import { getLocale, getTranslations } from "next-intl/server";

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
      "id, title, body, category_id, categories(id, name_am, name_en), tags, attribution_status, poem_number, view_count, source, poets(id, name_am, name_en)",
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

  const favoriteCounts = await getFavoriteCounts([poem.id]);

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

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <BackLink href="/poems">{tCommon("back")}</BackLink>
      <Card className="border border-border bg-card shadow-none">
        <CardHeader className="gap-5 border-b border-border bg-accent/45 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {/* The poem number is a large focal element here; cards keep the
                  small "#N" badge treatment. */}
              {typeof poem.poem_number === "number" ? (
                <p
                  className="mb-2 flex items-baseline gap-1 font-serif font-bold leading-none tracking-tight text-primary"
                  aria-label={`#${poem.poem_number}`}
                >
                  <span aria-hidden="true" className="text-2xl sm:text-3xl">
                    #
                  </span>
                  <span className="text-5xl tabular-nums sm:text-6xl">
                    {poem.poem_number}
                  </span>
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
    </article>
  );
}
