import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
} from "@/components/ui/card";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Poets" };

export default async function PoetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim();
  const tPoets = await getTranslations("Poets");

  const supabase = await createClient();

  let query = supabase
    .from("poets")
    .select("id, name_am, name_en, verified")
    .order("name_am");

  if (q) {
    query = query.or(`name_am.ilike.%${q}%,name_en.ilike.%${q}%`);
  }

  const { data: poets, error } = await query;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{tPoets("registry")}</p><h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tPoets("heading")}</h1><p className="text-sm leading-7 text-muted-foreground">{tPoets("subheading")}</p></div>

      <div className="mb-8"><UniversalSearch mode="poets" defaultValue={q} placeholder={tPoets("searchPlaceholder")} /></div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          {tPoets("loadError")}
        </p>
      ) : poets && poets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {poets.map((poet) => (
            <Card
              key={poet.id}
              className="content-card border border-border bg-card shadow-none"
            >
              <Link href={`/poets/${poet.id}`} className="block p-5 text-left">
                <div className="font-serif text-lg font-semibold text-foreground">
                  {poet.name_am}
                </div>
                {poet.name_en ? (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {poet.name_en}
                  </div>
                ) : null}
                {poet.verified ? <Badge variant="secondary" className="mt-4">{tPoets("verified")}</Badge> : null}
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title={q ? tPoets("noPoetsTitle") : tPoets("noPoetsYet")} description={q ? tPoets("noPoetsDesc") : tPoets("noPoetsYetDesc")} />
      )}
    </div>
  );
}