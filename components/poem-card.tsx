import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { AttributionBadge } from "@/components/attribution-badge";
import { PoemViewCount } from "@/components/poem-view-count";
import { Folio } from "@/components/manuscript/folio";
import { useLocale, useTranslations } from "next-intl";
import { Heart } from "lucide-react";

export type CategoryData = {
  id?: string;
  name_am?: string | null;
  name_en?: string | null;
};

export type PoemCardData = {
  id: string;
  title: string;
  body?: string;
  category?: CategoryData | string | null;
  categoryName?: string | null;
  tags?: string[] | null;
  attribution_status?: string;
  poemNumber?: number | null;
  poetName?: string | null;
  viewCount?: number | null;
};

function firstFourLines(body: string): string {
  return body.split(/\r?\n/).slice(0, 4).join("\n").trim();
}

export function PoemCard({
  poem,
  favorited = false,
  favoriteCount = 0,
  showFavorite = true,
  showFavoriteCount = showFavorite,
}: {
  poem: PoemCardData;
  favorited?: boolean;
  favoriteCount?: number;
  showFavorite?: boolean;
  showFavoriteCount?: boolean;
}) {
  const locale = useLocale();
  const tPoems = useTranslations("Poems");

  const displayCategory = poem.categoryName
    ? poem.categoryName
    : typeof poem.category === "object" && poem.category !== null
      ? locale === "am"
        ? poem.category.name_am || poem.category.name_en
        : poem.category.name_en || poem.category.name_am
      : typeof poem.category === "string"
        ? poem.category
        : null;

  const renderAttribution = (status?: string) => (
    <AttributionBadge status={status} />
  );

  return (
    <Card className="content-card group relative h-full gap-0 overflow-hidden border-border bg-card py-0 shadow-none">
      {/* A terracotta rule draws across the top edge on hover/focus. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-5 top-0 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-(--duration-slow) ease-(--ease-out-soft) group-hover:scale-x-100 group-has-focus-visible:scale-x-100"
      />
      <Link
        href={`/poems/${poem.id}`}
        className="absolute inset-0 z-0 rounded-xl outline-none"
        aria-label={`${tPoems("openPoem")}: ${poem.title}`}
      />
      <CardHeader className="pointer-events-none relative z-10 gap-0 px-5 pt-5">
        {/* Folio top-left, view/favorite stats top-right; the title gets its
            own full-width line below, so long titles never wrap because of
            the stats. */}
        {poem.poemNumber != null ||
        showFavorite ||
        showFavoriteCount ||
        poem.viewCount != null ? (
          <div className="flex min-h-9 items-center justify-between gap-2">
            {poem.poemNumber != null ? (
              <Folio number={poem.poemNumber} />
            ) : (
              <span />
            )}
            {showFavorite || showFavoriteCount || poem.viewCount != null ? (
              <div className="pointer-events-auto flex items-center gap-2">
                {poem.viewCount != null ? (
                  <PoemViewCount viewCount={poem.viewCount} />
                ) : null}
                {showFavorite ? (
                  <FavoriteToggle
                    poemId={poem.id}
                    initialFavorited={favorited}
                    initialFavoriteCount={favoriteCount}
                  />
                ) : showFavoriteCount ? (
                  <span
                    className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"
                    aria-label={tPoems("likesCount", { count: favoriteCount })}
                  >
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
                    >
                      <Link
                        href="/login"
                        aria-label={tPoems("loginToFavorite")}
                      >
                        <Heart className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    {favoriteCount}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        <CardTitle className="mt-3 line-clamp-2 font-serif text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {poem.title}
        </CardTitle>
        {poem.poetName ? (
          <p className="mt-1 text-sm text-secondary">
            {tPoems("by")} {poem.poetName}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="pointer-events-none relative z-10 flex flex-1 flex-col px-5 pb-5">
        {poem.body ? (
          <p className="mt-4 whitespace-pre-line text-[0.94rem] leading-7 text-foreground/75 mask-[linear-gradient(to_bottom,black_55%,transparent)]">
            {firstFourLines(poem.body)}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 border-t border-dashed border-border/80 pt-4">
          {renderAttribution(poem.attribution_status)}
          {displayCategory ? (
            <Badge variant="outline">{displayCategory}</Badge>
          ) : null}
          {(poem.tags ?? []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
