import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Poets" };

export default async function PoetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim();

  const supabase = await createClient();

  let query = supabase
    .from("poets")
    .select("id, name_am, name_en, verified")
    .order("name_am");

  if (q) {
    query = query.or(`name_am.ilike.%${q}%,name_en.ilike.%${q}%`);
  }

  const { data: poets, error } = await query;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Poets</h1>

      <form method="get" action="/poets" className="mb-8 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search poets by name…"
          className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Search
        </button>
      </form>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          Could not load poets.
        </p>
      ) : poets && poets.length > 0 ? (
        <ul className="divide-y">
          {poets.map((poet) => (
            <li key={poet.id} className="py-3">
              <Link
                href={`/poets/${poet.id}`}
                className="font-medium hover:underline"
              >
                {poet.name_am}
              </Link>
              {poet.name_en ? (
                <span className="ml-2 text-sm text-zinc-500">
                  {poet.name_en}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-zinc-500">
          {q
            ? "No poets match your search."
            : "No poets yet. Poets are added by moderators from the Supabase dashboard."}
        </p>
      )}
    </div>
  );
}