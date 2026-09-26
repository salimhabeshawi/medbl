import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { optionList, type ListFilterOption } from "@/lib/filter-options";
import { EmptyState } from "@/components/empty-state";
import { ListFilters } from "@/components/list-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/back-link";
import { getLocale, getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "My submissions" };

function param(value?: string | string[]): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

type SubmissionRow = {
  id: string;
  title: string;
  poet_id: string | null;
  proposed_poet_name_am: string | null;
  category_id: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  categories:
    | { name_am: string | null; name_en: string | null }[]
    | { name_am: string | null; name_en: string | null }
    | null;
  poets:
    | { name_am: string; name_en: string | null }[]
    | { name_am: string; name_en: string | null }
    | null;
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <Badge variant={status === "approved" ? "secondary" : status === "rejected" ? "destructive" : "outline"}>
      {label}
    </Badge>
  );
}

export default async function MySubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string | string[];
    poet?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const category = param(params.category);
  const poet = param(params.poet);
  const locale = await getLocale();
  const supabase = await createClient();
  const tSubs = await getTranslations("MySubmissions");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error: submissionsError } = await supabase
    .from("poem_submissions")
    .select(
      "id, title, poet_id, proposed_poet_name_am, category_id, categories(name_am, name_en), poets(name_am, name_en), status, rejection_reason, created_at",
    )
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  const submissions = (data ?? []) as SubmissionRow[];

  // Filter options come from THIS user's submissions only — never the
  // site-wide category/poet registries. Submissions that still only propose a
  // new poet (no poet_id) are simply not offered as a poet filter value.
  const categoryOptions: ListFilterOption[] = optionList(
    submissions.map((sub) => {
      if (!sub.category_id) return null;
      const row = firstRelation<{
        name_am: string | null;
        name_en: string | null;
      }>(sub.categories);
      const label =
        locale === "am" ? row?.name_am || row?.name_en : row?.name_en || row?.name_am;
      return { id: sub.category_id, label: label || sub.category_id };
    }),
  );
  const poetOptions: ListFilterOption[] = optionList(
    submissions.map((sub) => {
      if (!sub.poet_id) return null;
      const row = firstRelation<{ name_am: string; name_en: string | null }>(
        sub.poets,
      );
      return {
        id: sub.poet_id,
        label: row?.name_am || row?.name_en || tSubs("unknownPoet"),
      };
    }),
  );

  // The two filters combine (category AND poet) when both are set; both live
  // in the URL so the filtered view survives a refresh and is shareable.
  const filteredSubmissions = submissions.filter(
    (sub) =>
      (!category || sub.category_id === category) &&
      (!poet || sub.poet_id === poet),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <BackLink href="/">{tSubs("back")}</BackLink>
      <div className="mb-10"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{tSubs("eyebrow")}</p><h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tSubs("title")}</h1><p className="text-sm leading-7 text-muted-foreground">{tSubs("subtitle")}</p></div>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-semibold">{tSubs("sectionTitle")}</h2>
        <Link href="/submit" className="mb-4 inline-flex text-sm font-medium text-primary hover:underline">{tSubs("submitNew")}</Link>
        {submissionsError ? (
          <EmptyState title={tSubs("errorTitle")} description={submissionsError.message} />
        ) : submissions.length === 0 ? (
          <EmptyState title={tSubs("emptyTitle")} description={tSubs("emptyDesc")} />
        ) : (
          <>
            <ListFilters
              categoryOptions={categoryOptions}
              poetOptions={poetOptions}
              categoryValue={category}
              poetValue={poet}
            />
            {filteredSubmissions.length === 0 ? (
              <EmptyState title={tSubs("noMatchTitle")} description={tSubs("noMatchDesc")} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredSubmissions.map((sub) => {
                  const poet = firstRelation<{
                    name_am: string;
                    name_en: string | null;
                  }>(sub.poets);
                  return (
                    <Card key={sub.id} className="border-primary/15 shadow-sm"><CardContent className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{sub.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {sub.proposed_poet_name_am
                              ? tSubs("proposedPoet", { name: sub.proposed_poet_name_am })
                              : poet?.name_am ?? poet?.name_en ?? tSubs("unknownPoet")}{" "}
                            · {new Date(sub.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={sub.status} label={sub.status === "approved" ? tSubs("approved") : sub.status === "rejected" ? tSubs("rejected") : tSubs("pending")} />
                      </div>
                      {sub.status === "rejected" && sub.rejection_reason ? (
                        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          {tSubs("reason")}: {sub.rejection_reason}
                        </p>
                      ) : null}
                    </CardContent></Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}