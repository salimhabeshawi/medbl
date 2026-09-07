import Link from "next/link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";

export type PoemCardData = {
  id: string;
  title: string;
  body?: string;
  category?: string | null;
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
  return (
    <Card className="content-card relative border-border bg-card shadow-none">
      <Link href={`/poems/${poem.id}`} className="absolute inset-0 z-0 rounded-xl" aria-label={`Open ${poem.title}`} />
      <CardHeader className="relative z-10 pointer-events-none">
        <CardTitle className="font-sans text-base text-foreground"><span>{poem.title}</span></CardTitle>
        {showFavorite ? <CardAction className="pointer-events-auto"><FavoriteToggle poemId={poem.id} initialFavorited={favorited} initialFavoriteCount={favoriteCount} /></CardAction> : null}
      </CardHeader>
      <CardContent className="relative z-10 pointer-events-none space-y-3">
        {poem.poetName ? <p className="text-sm text-secondary">by {poem.poetName}</p> : null}
        {poem.body ? <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{firstFourLines(poem.body)}</p> : null}
        <div className="flex flex-wrap gap-2">
          {poem.attribution_status === "disputed" ? <DisputedTag /> : poem.attribution_status ? <Badge variant={poem.attribution_status === "verified" ? "default" : "secondary"}>{poem.attribution_status}</Badge> : null}
          {poem.category ? <Badge variant="outline">{poem.category}</Badge> : null}
          {(poem.tags ?? []).slice(0, 3).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
        </div>
      </CardContent>
    </Card>
  );
}
