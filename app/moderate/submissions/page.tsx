import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { SubmissionReview } from "@/components/submission-review";

export const metadata = { title: "Moderation — submissions" };

type PoetMatch = {
  id: string;
  name_am: string;
  name_en: string | null;
};

export default async function ModerateSubmissionsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("poem_submissions")
    .select(
      "id, title, body, source, category, tags, created_at, status, poet_id, proposed_poet_name_am, proposed_poet_name_en, proposed_poet_bio, poets(name_am, name_en)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-semibold">Pending submissions</h2>
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          Could not load submissions: {error.message}
        </p>
      </div>
    );
  }

  const submissions = data ?? [];

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
      <h2 className="mb-6 text-2xl font-semibold">Pending submissions</h2>
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
                category={sub.category}
                tags={Array.isArray(sub.tags) ? sub.tags : null}
                poetId={sub.poet_id}
                poetName={
                  poet ? (poet.name_am ?? poet.name_en ?? null) : null
                }
                proposal={proposal}
                matches={matchesBySubmission.get(sub.id) ?? []}
                createdAt={sub.created_at}
              />
            );
          })}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed px-4 py-12 text-center text-sm text-zinc-500">
          No submissions are waiting for review.
        </p>
      )}
    </div>
  );
}