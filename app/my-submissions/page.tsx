import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";

export const metadata: Metadata = { title: "My submissions" };

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "bg-zinc-100 text-zinc-700"}`}
    >
      {status}
    </span>
  );
}

export default async function MySubmissionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: submissions, error: submissionsError } = await supabase
    .from("poem_submissions")
    .select(
      "id, title, poet_id, proposed_poet_name_am, poets(name_am, name_en), status, rejection_reason, created_at",
    )
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">My submissions</h1>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Poem submissions</h2>
        {submissionsError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
            Could not load poem submissions: {submissionsError.message}
          </p>
        ) : submissions && submissions.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {submissions.map((sub) => {
              const poet = firstRelation<{ name_am: string; name_en: string }>(
                sub.poets,
              );
              return (
                <li key={sub.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{sub.title}</p>
                      <p className="text-sm text-zinc-500">
                        {sub.proposed_poet_name_am
                          ? `Proposed new poet: ${sub.proposed_poet_name_am}`
                          : poet?.name_am ?? poet?.name_en ?? "Unknown poet"}{" "}
                        · {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                  {sub.status === "rejected" && sub.rejection_reason ? (
                    <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                      Reason: {sub.rejection_reason}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-zinc-500">
            You haven&apos;t submitted any poems yet.
          </p>
        )}
      </section>
    </div>
  );
}