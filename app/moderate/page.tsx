import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Moderation" };

async function count(
  query: PromiseLike<{ count: number | null; error: unknown }>,
) {
  const result = await query;
  return result.error ? null : (result.count ?? 0);
}

export default async function ModerateOverviewPage() {
  const supabase = await createClient();

  const [pendingSubmissions, pendingRequests, openReports] = await Promise.all([
    count(
      supabase
        .from("poem_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ),
    count(
      supabase
        .from("poet_requests")
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

  const cards = [
    {
      href: "/moderate/submissions",
      label: "Pending poem submissions",
      value: pendingSubmissions,
      hint: "Review poem text, poet link and source.",
    },
    {
      href: "/moderate/poet-requests",
      label: "Pending poet requests",
      value: pendingRequests,
      hint: "Approve to add a poet to the curated registry.",
    },
    {
      href: "/moderate/reports",
      label: "Open reports",
      value: openReports,
      hint: "Wrong attribution, copyright claims and more.",
    },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border p-6 transition hover:shadow-sm"
          >
            <p className="text-3xl font-bold">
              {card.value === null ? "–" : card.value}
            </p>
            <p className="mt-1 font-medium">{card.label}</p>
            <p className="mt-1 text-sm text-zinc-500">{card.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}