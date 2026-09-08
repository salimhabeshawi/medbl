"use client";

import Link from "next/link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";
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
  poetName?: string | null;
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
      <CardHeader className="relative z-10 pointer-events-none">
        <CardTitle className="font-sans text-base text-foreground"><span>{poem.title}</span></CardTitle>
        {showFavorite ? <CardAction className="pointer-events-auto"><FavoriteToggle poemId={poem.id} initialFavorited={favorited} initialFavoriteCount={favoriteCount} /></CardAction> : null}
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
