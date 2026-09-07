"use client";

import { useState } from "react";
import Link from "next/link";
import { FavoriteToggle } from "./favorite-toggle";
import { Badge } from "./ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card";

export function FavoriteRow({
  poem,
  poet,
}: {
  poem: {
    id: string;
    title: string;
    category: string | null;
    tags: string[] | null;
  };
  poet: { name_am: string; name_en: string } | null;
}) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <Card className="border-primary/15 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-sans text-base"><Link href={`/poems/${poem.id}`} className="hover:text-primary">{poem.title}</Link></CardTitle>
        <CardAction><FavoriteToggle poemId={poem.id} initialFavorited={true} onUnfavorited={() => setHidden(true)} /></CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="min-w-0">
        <Link
          href={`/poems/${poem.id}`}
          className="font-serif text-lg hover:text-primary"
        >
          {poem.title}
        </Link>
        {poet ? (
          <p className="mt-1 text-sm text-muted-foreground">by {poet.name_am ?? poet.name_en}</p>
        ) : null}
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