import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { ListSortSelect, type ListSort } from "@/components/list-sort-select";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Poets" };

type PoetRow = {
  id: string;
  name_am: string;
  name_en: string | null;
  verified: boolean;
  poems_count: number;
  likes_count: number;
  avg_likes_per_poem: number | null;
};

export default async function PoetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : (params.q ?? "")).trim();
  const rawSort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort: ListSort = [
    "poems_desc",
    "poems_asc",
    "likes_desc",
    "likes_asc",
    "avg_likes_desc",
    "avg_likes_asc",
  ].includes(rawSort ?? "")
    ? (rawSort as ListSort)
    : "poems_desc";
  const tPoets = await getTranslations("Poets");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("list_poets", {
    p_sort: sort,
    p_query: q || null,
  });
  const poets = (data ?? []) as PoetRow[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {tPoets("registry")}
        </p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {tPoets("heading")}
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          {tPoets("subheading")}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="min-w-0 flex-1">
          <UniversalSearch
            mode="poets"
            defaultValue={q}
            placeholder={tPoets("searchPlaceholder")}
          />
        </div>
        <ListSortSelect
          value={sort}
          options={[
            "poems_desc",
            "poems_asc",
            "likes_desc",
            "likes_asc",
            "avg_likes_desc",
            "avg_likes_asc",
          ]}
          heightClassName="h-11"
          compact
        />
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          {tPoets("loadError")}
        </p>
      ) : poets && poets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {poets.map((poet) => {
            return (
              <Card
                key={poet.id}
                className="content-card border border-border bg-card shadow-none"
              >
                <Link
                  href={`/poets/${poet.id}`}
                  className="block p-4 text-left"
                >
                  <div className="font-semibold">{poet.name_am}</div>
                  {poet.name_en ? (
                    <div className="text-sm text-muted-foreground">
                      {poet.name_en}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {tPoets("poemCount", { count: poet.poems_count })}
                    </Badge>
                    <Badge variant="outline">
                      {tPoets("likeCount", { count: poet.likes_count })}
                    </Badge>
                    {poet.avg_likes_per_poem !== null ? (
                      <Badge variant="secondary">
                        {tPoets("avgLikesPerPoem", {
                          value: Number(poet.avg_likes_per_poem).toFixed(1),
                        })}
                      </Badge>
                    ) : null}
                  </div>
                  {poet.verified ? (
                    <Badge variant="secondary" className="mt-3">
                      {tPoets("verified")}
                    </Badge>
                  ) : null}
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={q ? tPoets("noPoetsTitle") : tPoets("noPoetsYet")}
          description={q ? tPoets("noPoetsDesc") : tPoets("noPoetsYetDesc")}
        />
      )}
    </div>
  );
}
