"use client";

import { useState } from "react";
import Link from "next/link";
import { FavoriteToggle } from "./favorite-toggle";
import { PoemViewCount } from "./poem-view-count";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslations } from "next-intl";

export function FavoriteRow({
  poem,
  poet,
  favoriteCount = 0,
  viewCount = 0,
}: {
  poem: {
    id: string;
    title: string;
    body: string;
    category: string | null;
    tags: string[] | null;
    poem_number?: number | null;
  };
  poet: { name_am: string; name_en: string } | null;
  favoriteCount?: number;
  viewCount?: number;
}) {
  const [hidden, setHidden] = useState(false);
  const tPoems = useTranslations("Poems");

  if (hidden) return null;

  return (
    <Card className="content-card relative border-primary/15">
      <Link href={`/poems/${poem.id}`} className="absolute inset-0 z-0 rounded-xl" aria-label={`${tPoems("openPoem")}: ${poem.title}`} />
      <CardHeader className="gap-2">
        {/* Poem number top-left, view/favorite stats top-right; the title gets
            its own full-width line below, so long titles never wrap because of
            the stats. */}
        <div className="pointer-events-none relative z-10 flex items-center justify-between gap-2">
          <span className="font-bold tabular-nums text-base text-muted-foreground">
            {poem.poem_number != null ? `#${poem.poem_number}` : null}
          </span>
          <div className="pointer-events-auto flex items-center gap-2">
            <PoemViewCount viewCount={viewCount} />
            <FavoriteToggle poemId={poem.id} initialFavorited={true} initialFavoriteCount={favoriteCount} onUnfavorited={() => setHidden(true)} />
          </div>
        </div>
        <CardTitle className="relative z-10 font-sans text-base pointer-events-none">
          {poem.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 pointer-events-none space-y-3">
        <div className="min-w-0">
        <Link
          href={`/poems/${poem.id}`}
          className="font-serif text-lg hover:text-primary"
        >
          {poem.title}
        </Link>
        {poet ? (
          <p className="mt-1 text-sm text-muted-foreground">{tPoems("by")} {poet.name_am ?? poet.name_en}</p>
        ) : null}
        <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{poem.body.split(/\r?\n/).slice(0, 4).join("\n").trim()}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {poem.category ? <Badge variant="outline">{poem.category}</Badge> : null}
          {Array.isArray(poem.tags) && poem.tags.length > 0 ? (
            poem.tags.map((t: string) => (
              <Badge key={t} variant="secondary">#{t}</Badge>
            ))
          ) : null}
        </div>
        </div>
      </CardContent>
    </Card>
  );
}