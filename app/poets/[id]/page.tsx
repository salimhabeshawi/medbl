import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getFavoritePoemIds } from "@/lib/favorites";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { DisputedTag } from "@/components/disputed-tag";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: poet } = await supabase
    .from("poets")
    .select("name_am")
    .eq("id", id)
    .single();
  return { title: poet?.name_am ?? "Poet" };
}

export default async function PoetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: poet, error } = await supabase
    .from("poets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !poet) notFound();

  const { data: poems } = await supabase
    .from("poems")
    .select("id, title, category, attribution_status, created_at")
    .eq("poet_id", id)
    .order("created_at", { ascending: false });

  const years =
    poet.birth_year || poet.death_year
      ? `${poet.birth_year ?? "?"} – ${poet.death_year ?? "?"}`
      : null;

  const user = await getCurrentUser();
  const favIds = await getFavoritePoemIds((poems ?? []).map((p) => p.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 text-3xl font-bold">{poet.name_am}</h1>
      {poet.name_en ? (
        <p className="text-zinc-500">{poet.name_en}</p>
      ) : null}
      {years ? <p className="mt-1 text-sm text-zinc-500">{years}</p> : null}

      {poet.bio ? (
        <p className="mt-6 whitespace-pre-line leading-7 text-zinc-700 dark:text-zinc-300">
          {poet.bio}
        </p>
      ) : null}

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold">Poems</h2>
        {poems && poems.length > 0 ? (
          <ul className="divide-y">
            {poems.map((poem) => (
              <li
                key={poem.id}
                className="flex items-center justify-between gap-4 py-3"
              >
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
                  {poem.category ? (
                    <span className="ml-2 text-sm text-zinc-500">
                      {poem.category}
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
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-zinc-500">
            No published poems for this poet yet.
          </p>
        )}
      </section>
    </div>
  );
}