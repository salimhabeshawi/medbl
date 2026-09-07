import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getCurrentUser, getFavoritePoemIds } from "@/lib/favorites";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Poems" };

const PAGE_SIZE = 20;

function param(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function pageUrl(params: {
  q: string;
  category: string;
  tag: string;
  page: number;
}): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/poems?${qs}` : "/poems";
}

export default async function PoemsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    tag?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = param(params.q).trim();
  const category = param(params.category);
  const tag = param(params.tag);
  const page = Math.max(1, parseInt(param(params.page), 10) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("poems")
    .select(
      "id, title, category, tags, attribution_status, poet_id, poets(name_am, name_en), created_at",
      { count: "exact" },
    )
    .neq("attribution_status", "disputed")
    .order("created_at", { ascending: false });

  if (q) {
    const { data: searchResults } = await supabase.rpc("search_poems", {
      p_query: q,
      p_limit: 100,
    });
    const ids = ((searchResults ?? []) as { id: string }[]).map(
      (result) => result.id,
    );
    query = ids.length > 0 ? query.in("id", ids) : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }
  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: poems, count } = await query;

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const user = await getCurrentUser();
  const favIds = await getFavoritePoemIds((poems ?? []).map((p) => p.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Poems</h1>

      <div className="mb-6"><UniversalSearch defaultValue={q} /></div>

      {(q || category || tag) && (
        <p className="mb-4 text-sm text-muted-foreground">
          Filters:
          {q ? (
            <span className="ml-1 rounded bg-muted px-2 py-0.5 text-muted-foreground">
              “{q}”
            </span>
          ) : null}
          {category ? (
            <span className="ml-1 rounded bg-muted px-2 py-0.5 text-muted-foreground">
              {category}
            </span>
          ) : null}
          {tag ? (
            <span className="ml-1 rounded bg-muted px-2 py-0.5 text-muted-foreground">
              #{tag}
            </span>
          ) : null}
          <Link href="/poems" className="underline">
            Clear
          </Link>
        </p>
      )}

      {poems && poems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {poems.map((poem) => {
            const poet = firstRelation<{
              name_am: string;
              name_en: string;
            }>(poem.poets);
            const tags = Array.isArray(poem.tags) ? poem.tags.slice(0, 3) : [];

            return (
              <Card
                key={poem.id}
                className="border border-border bg-card shadow-none transition hover:border-primary/50 hover:bg-background/20"
              >
                <CardHeader>
                  <CardTitle className="font-sans text-base text-foreground">
                    <Link href={`/poems/${poem.id}`} className="hover:text-primary">
                      {poem.title}
                    </Link>
                  </CardTitle>
                  {user ? (
                    <CardAction>
                      <FavoriteToggle
                        poemId={poem.id}
                        initialFavorited={favIds.has(poem.id)}
                      />
                    </CardAction>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3">
                  {poet ? (
                    <p className="text-sm text-muted-foreground">
                      by {poet.name_am ?? poet.name_en}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {poem.attribution_status === "disputed" ? (
                      <DisputedTag />
                    ) : (
                      <Badge
                        variant={
                          poem.attribution_status === "verified"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {poem.attribution_status}
                      </Badge>
                    )}
                    {poem.category ? (
                      <Badge variant="outline">{poem.category}</Badge>
                    ) : null}
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title={q || category || tag ? "No poems match your filters" : "No poems published yet"} description={q || category || tag ? "Try a different phrase, poet name, or theme." : "The anthology is waiting for its next voice."} />
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-between">
          {page > 1 ? (
            <Link
              href={pageUrl({ q, category, tag, page: page - 1 })}
              className="rounded-md border border-border px-3 py-1.5 transition hover:bg-accent hover:text-foreground"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-muted-foreground">
            Page {Math.min(page, totalPages)} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageUrl({ q, category, tag, page: page + 1 })}
              className="rounded-md border border-border px-3 py-1.5 transition hover:bg-accent hover:text-foreground"
            >
              Next
            </Link>
          ) : null}
        </nav>
      )}
    </div>
  );
}