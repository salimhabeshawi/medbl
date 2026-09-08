import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { SubmissionReview } from "@/components/submission-review";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/empty-state";
import { BackLink } from "@/components/back-link";
import type { CategorySelectRecord } from "@/components/category-select";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Moderation — submissions" };

type PoetMatch = {
  id: string;
  name_am: string;
  name_en: string | null;
};

export default async function ModerateSubmissionsPage() {
  const supabase = await createClient();
  const tMod = await getTranslations("Moderate");
  const { data, error } = await supabase
    .from("poem_submissions")
    .select(
      "id, title, body, source, category_id, tags, created_at, status, poet_id, proposed_poet_name_am, proposed_poet_name_en, proposed_poet_bio, poets(name_am, name_en)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div>
        <BackLink href="/moderate">{tMod("backModeration")}</BackLink>
        <h2 className="mb-6 font-serif text-2xl font-semibold">{tMod("pendingHeading")}</h2>
        <Alert variant="destructive"><AlertTitle>{tMod("loadSubmissionsError")}</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>
      </div>
    );
  }

  const submissions = data ?? [];
  const { data: categoryRows } = await supabase.from("categories").select("id, name_am, name_en").order("name_en");
  const categories = (categoryRows ?? []) as CategorySelectRecord[];

  // For proposals, fetch the top fuzzy-matched existing poets so the
  // moderator can avoid creating a duplicate registry entry.
  const proposedSubs = submissions.filter((s) => s.proposed_poet_name_am);
  const matchResults = await Promise.all(
    proposedSubs.map((s) =>
      supabase.rpc("match_poets", { p_name: s.proposed_poet_name_am }),
    ),
  );
  const matchesBySubmission = new Map<string, PoetMatch[]>();
  proposedSubs.forEach((s, i) => {
    const { data: matches, error: matchError } = matchResults[i];
    matchesBySubmission.set(
      s.id,
      matchError ? [] : ((matches ?? []) as PoetMatch[]),
    );
  });

  return (
    <div>
      <BackLink href="/moderate">{tMod("backModeration")}</BackLink>
      <h2 className="mb-6 font-serif text-2xl font-semibold">{tMod("pendingHeading")}</h2>
      {submissions.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {submissions.map((sub) => {
            const poet = firstRelation<{ name_am: string; name_en: string }>(
              sub.poets,
            );
            const proposal = sub.proposed_poet_name_am
              ? {
                  nameAm: sub.proposed_poet_name_am,
                  nameEn: sub.proposed_poet_name_en,
                  bio: sub.proposed_poet_bio,
                }
              : null;
            return (
              <SubmissionReview
                key={sub.id}
                id={sub.id}
                title={sub.title}
                body={sub.body}
                source={sub.source}
                categoryId={sub.category_id}
                tags={Array.isArray(sub.tags) ? sub.tags : null}
                poetId={sub.poet_id}
                poetName={
                  poet ? (poet.name_am ?? poet.name_en ?? null) : null
                }
                proposal={proposal}
                matches={matchesBySubmission.get(sub.id) ?? []}
                createdAt={sub.created_at}
                categories={categories}
              />
            );
          })}
        </ul>
      ) : (
        <EmptyState title={tMod("queueClear")} description={tMod("queueClearDesc")} />
      )}
    </div>
  );
}