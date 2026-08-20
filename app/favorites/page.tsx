import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { FavoriteRow } from "@/components/favorite-row";

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

export default async function FavoritesPage() {
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">My favorites</h1>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          Could not load your favorites.
        </p>
      ) : rows.length > 0 ? (
        <ul className="divide-y">
          {rows.map((row) => (
            <FavoriteRow key={row.poem.id} poem={row.poem} poet={row.poet} />
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-zinc-500">
          You have no favorite poems yet. Tap the heart on any poem to add it.
        </p>
      )}
    </div>
  );
}