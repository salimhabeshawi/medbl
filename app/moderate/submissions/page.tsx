import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { SubmissionReview } from "@/components/submission-review";

export const metadata = { title: "Moderation — submissions" };

export default async function ModerateSubmissionsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("poem_submissions")
    .select(
      "id, title, body, source, created_at, status, poet_id, poets(name_am, name_en)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Pending submissions</h2>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          Could not load submissions: {error.message}
        </p>
      ) : data && data.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {data.map((sub) => {
            const poet = firstRelation<{ name_am: string; name_en: string }>(
              sub.poets,
            );
            return (
              <SubmissionReview
                key={sub.id}
                id={sub.id}
                title={sub.title}
                body={sub.body}
                poetName={poet?.name_am ?? poet?.name_en ?? "Unknown poet"}
                source={sub.source}
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