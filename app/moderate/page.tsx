import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, FileCheck2, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryManager } from "@/components/category-manager";
import { BackLink } from "@/components/back-link";
import type { CategoryRecord } from "@/components/category-manager";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Moderation" };

async function count(
  query: PromiseLike<{ count: number | null; error: unknown }>,
) {
  const result = await query;
  return result.error ? null : (result.count ?? 0);
}

export default async function ModerateOverviewPage() {
  const supabase = await createClient();
  const tMod = await getTranslations("Moderate");

  const [pendingSubmissions, openReports] = await Promise.all([
    count(
      supabase
        .from("poem_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ),
    count(
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
    ),
  ]);
  const { data: categoryRows } = await supabase.from("categories").select("id, name_am, name_en").order("name_en");

  const cards = [
    {
      href: "/moderate/submissions",
      label: tMod("pendingSubmissionsCard"),
      value: pendingSubmissions,
      hint: tMod("pendingSubmissionsHint"),
    },
    {
      href: "/moderate/reports",
      label: tMod("openReportsCard"),
      value: openReports,
      hint: tMod("openReportsHint"),
    },
  ];

  return (
    <div>
      <BackLink href="/">{tMod("backHome")}</BackLink>
      <h2 className="mb-6 font-serif text-2xl font-semibold">{tMod("overview")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="content-card h-full border-primary/15"><CardContent className="p-6">
            <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">{card.href.includes("reports") ? <Flag className="size-5" /> : <FileCheck2 className="size-5" />}</div>
            <p className="text-4xl font-semibold tracking-tight">
              {card.value === null ? "–" : card.value}
            </p>
            <p className="mt-2 font-medium">{card.label}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.hint}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">{tMod("openQueue")} <ArrowRight className="size-4" /></span>
            </CardContent></Card>
          </Link>
        ))}
      </div>
      <CategoryManager categories={(categoryRows ?? []) as CategoryRecord[]} />
    </div>
  );
}