"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";
import { PoemViewCount } from "@/components/poem-view-count";
import { useLocale, useTranslations } from "next-intl";

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
}: {
  poem: PoemCardData;
  favorited?: boolean;
  favoriteCount?: number;
  showFavorite?: boolean;
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

  const renderAttribution = (status?: string) => {
    if (status === "disputed") return <DisputedTag />;
    if (status === "verified") return <Badge variant="default">{tPoems("verifiedBadge")}</Badge>;
    if (status === "community") return <Badge variant="secondary">{tPoems("communityBadge")}</Badge>;
    return null;
  };

  return (
    <Card className="content-card relative border-border bg-card shadow-none">
      <Link href={`/poems/${poem.id}`} className="absolute inset-0 z-0 rounded-xl" aria-label={`${tPoems("openPoem")}: ${poem.title}`} />
      <CardHeader className="relative z-10 gap-2 pointer-events-none">
        {/* Poem number top-left, view/favorite stats top-right; the title gets
            its own full-width line below, so long titles never wrap because of
            the stats. */}
        {poem.poemNumber != null || showFavorite || poem.viewCount != null ? (
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold tabular-nums text-base text-muted-foreground">
              {poem.poemNumber != null ? `#${poem.poemNumber}` : null}
            </span>
            {showFavorite || poem.viewCount != null ? (
              <div className="pointer-events-auto flex items-center gap-2">
                {poem.viewCount != null ? (
                  <PoemViewCount viewCount={poem.viewCount} />
                ) : null}
                {showFavorite ? (
                  <FavoriteToggle poemId={poem.id} initialFavorited={favorited} initialFavoriteCount={favoriteCount} />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        <CardTitle className="font-sans text-base text-foreground">
          <span>{poem.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 pointer-events-none space-y-3">
        {poem.poetName ? <p className="text-sm text-secondary">{tPoems("by")} {poem.poetName}</p> : null}
        {poem.body ? <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{firstFourLines(poem.body)}</p> : null}
        <div className="flex flex-wrap gap-2">
          {renderAttribution(poem.attribution_status)}
          {displayCategory ? <Badge variant="outline">{displayCategory}</Badge> : null}
          {(poem.tags ?? []).slice(0, 3).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
        </div>
      </CardContent>
    </Card>
  );
}
