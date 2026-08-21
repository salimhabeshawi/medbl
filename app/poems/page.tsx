import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getCurrentUser, getFavoritePoemIds } from "@/lib/favorites";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";

export const metadata: Metadata = { title: "Poems" };

const PAGE_SIZE = 20;

function param(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function pageUrl(params: {
  q: string;
  category: string;
  tag: string;
  page: number;
}): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/poems?${qs}` : "/poems";
}

export default async function PoemsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    tag?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = param(params.q).trim();
  const category = param(params.category);
  const tag = param(params.tag);
  const page = Math.max(1, parseInt(param(params.page), 10) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("poems")
    .select(
      "id, title, category, tags, attribution_status, poet_id, poets(name_am, name_en), created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const [{ data: poems, count }, { data: categories }] = await Promise.all([
    query,
    supabase
      .from("poems")
      .select("category")
      .not("category", "is", null),
  ]);

  const allCategories = [
    ...new Set((categories ?? []).map((c) => c.category)),
  ].sort();

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const user = await getCurrentUser();
  const favIds = await getFavoritePoemIds((poems ?? []).map((p) => p.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Poems</h1>

      <form method="get" action="/poems" className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search poems by title…"
          className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <select
          name="category"
          defaultValue={category}
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Search
        </button>
      </form>

      {(q || category || tag) && (
        <p className="mb-4 text-sm text-zinc-500">
          Filters:
          {q ? (
            <span className="ml-1 rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              “{q}”
            </span>
          ) : null}
          {category ? (
            <span className="ml-1 rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              {category}
            </span>
          ) : null}
          {tag ? (
            <span className="ml-1 rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              #{tag}
            </span>
          ) : null}{" "}
          <Link href="/poems" className="underline">
            Clear
          </Link>
        </p>
      )}

      {poems && poems.length > 0 ? (
        <>
          <ul className="divide-y">
            {poems.map((poem) => {
              const poet = firstRelation<{
                name_am: string;
                name_en: string;
              }>(poem.poets);
              return (
                <li key={poem.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/poems/${poem.id}`}
                      className="font-medium hover:underline"
                    >
                      {poem.title}
                    </Link>
                    {poem.attribution_status === "disputed" ? (
                      <DisputedTag />
                    ) : null}
                    {poet ? (
                      <span className="ml-2 text-sm text-zinc-500">
                        — {poet.name_am ?? poet.name_en}
                      </span>
                    ) : null}
                    {poem.category ? (
                      <span className="ml-2 text-sm text-zinc-500">
                        {poem.category}
                      </span>
                    ) : null}
                    {Array.isArray(poem.tags) && poem.tags.length > 0 ? (
                      <span className="ml-2 text-sm text-zinc-400">
                        {poem.tags.map((t: string) => (
                          <Link
                            key={t}
                            href={`/poems?tag=${encodeURIComponent(t)}`}
                            className="mr-1 underline hover:text-zinc-600"
                          >
                            #{t}
                          </Link>
                        ))}
                      </span>
                    ) : null}
                  </div>
                  {user ? (
                    <FavoriteToggle
                      poemId={poem.id}
                      initialFavorited={favIds.has(poem.id)}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>

          <nav className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link
                href={pageUrl({ q, category, tag, page: page - 1 })}
                className="rounded-md border px-3 py-1.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Previous
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-zinc-400">Previous</span>
            )}
            <span className="text-zinc-500">
              Page {Math.min(page, totalPages)} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageUrl({ q, category, tag, page: page + 1 })}
                className="rounded-md border px-3 py-1.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Next
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-zinc-400">Next</span>
            )}
          </nav>
        </>
      ) : (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-zinc-500">
          {q || category || tag
            ? "No poems match your filters."
            : "No poems published yet."}
        </p>
      )}
    </div>
  );
}