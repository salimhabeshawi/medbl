import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { FavoriteRow } from "@/components/favorite-row";
import { UniversalSearch } from "@/components/universal-search";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "My favorites" };

type PoemRow = {
  id: string;
  title: string;
  category: string | null;
  tags: string[] | null;
  poets:
    | { name_am: string; name_en: string }[]
    | { name_am: string; name_en: string }
    | null;
};

type PoetRow = { name_am: string; name_en: string };

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().toLocaleLowerCase();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(
      "id, poem_id, created_at, poems(id, title, category, tags, poets(name_am, name_en))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (favorites ?? [])
    .map((fav) => {
      const poem = firstRelation<PoemRow>(fav.poems);
      if (!poem) return null;
      const poet = firstRelation<PoetRow>(poem.poets) ?? null;
      return { poem, poet };
    })
    .filter(
      (row): row is { poem: PoemRow; poet: PoetRow | null } => row !== null,
    );
  const filteredRows = q
    ? rows.filter(({ poem, poet }) =>
        [poem.title, poem.category, ...(poem.tags ?? []), poet?.name_am, poet?.name_en]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(q),
      )
    : rows;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your private shelf</p><h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">My favorites</h1><p className="text-sm leading-7 text-muted-foreground">A quiet place for the poems you want to return to.</p></div>
      <div className="mb-8"><UniversalSearch defaultValue={q} placeholder="Search your favorite poems..." /></div>

      {error ? (
        <EmptyState title="Could not load your favorites" description="Please refresh and try again." />
      ) : filteredRows.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((row) => (
            <FavoriteRow key={row.poem.id} poem={row.poem} poet={row.poet} />
          ))}
        </div>
      ) : (
        <EmptyState title={q ? "No favorites match your search" : "Your shelf is empty"} description={q ? "Try a different title, poet, tag, or category." : "Tap the heart on any poem to keep it close."} />
      )}
    </div>
  );
}