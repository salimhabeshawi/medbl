import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { ReportReview } from "@/components/report-review";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Moderation — reports" };

export default async function ModerateReportsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, reason, status, created_at, former_attribution_status, poem_id, poems(id, title, attribution_status)",
    )
    .eq("status", "open")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-semibold">Open reports</h2>
      {error ? (
        <Alert variant="destructive"><AlertTitle>Could not load reports</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>
      ) : data && data.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {data.map((report) => {
            const poem = firstRelation<{
              id: string;
              title: string;
              attribution_status: string;
            }>(report.poems);
            return (
              <ReportReview
                key={report.id}
                id={report.id}
                poemTitle={poem?.title ?? "Unknown poem"}
                poemId={report.poem_id}
                poemStatus={poem?.attribution_status ?? "community"}
                formerStatus={report.former_attribution_status}
                reason={report.reason}
                createdAt={report.created_at}
              />
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No open reports" description="The reports queue is clear." />
      )}
    </div>
  );
}