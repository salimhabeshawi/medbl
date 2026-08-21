import { createClient } from "@/lib/supabase/server";
import { PoetRequestReview } from "@/components/poet-request-review";

export const metadata = { title: "Moderation — poet requests" };

export default async function ModeratePoetRequestsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("poet_requests")
    .select("id, name_am, name_en, bio, source, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Pending poet requests</h2>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          Could not load poet requests: {error.message}
        </p>
      ) : data && data.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {data.map((req) => (
            <PoetRequestReview
              key={req.id}
              id={req.id}
              nameAm={req.name_am}
              nameEn={req.name_en}
              bio={req.bio}
              source={req.source}
              createdAt={req.created_at}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed px-4 py-12 text-center text-sm text-zinc-500">
          No poet requests are waiting for review.
        </p>
      )}
    </div>
  );
}