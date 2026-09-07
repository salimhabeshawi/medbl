import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "My submissions" };

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "approved" ? "secondary" : status === "rejected" ? "destructive" : "outline"} className="capitalize">
      {status}
    </Badge>
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your contribution</p><h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">My submissions</h1><p className="text-sm leading-7 text-muted-foreground">Follow each poem from submission through moderator review.</p></div>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-semibold">Poem submissions</h2>
        {submissionsError ? (
          <EmptyState title="Could not load submissions" description={submissionsError.message} />
        ) : submissions && submissions.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {submissions.map((sub) => {
              const poet = firstRelation<{ name_am: string; name_en: string }>(
                sub.poets,
              );
              return (
                <Card key={sub.id} className="border-primary/15 shadow-sm"><CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{sub.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.proposed_poet_name_am
                          ? `Proposed new poet: ${sub.proposed_poet_name_am}`
                          : poet?.name_am ?? poet?.name_en ?? "Unknown poet"}{" "}
                        · {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                  {sub.status === "rejected" && sub.rejection_reason ? (
                    <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      Reason: {sub.rejection_reason}
                    </p>
                  ) : null}
                </CardContent></Card>
              );
            })}
          </div>
        ) : (
          <EmptyState title="You have not submitted any poems" description="Your contributions will appear here after you submit them for review." />
        )}
      </section>
    </div>
  );
}