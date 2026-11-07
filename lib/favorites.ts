import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getFavoritePoemIds(
  poemIds: string[],
): Promise<Set<string>> {
  if (poemIds.length === 0) return new Set();
  const user = await getCurrentUser();
  if (!user) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("poem_id")
    .eq("user_id", user.id)
    .in("poem_id", poemIds);

  return new Set((data ?? []).map((row) => row.poem_id));
}

export async function getFavoriteCounts(poemIds: string[]): Promise<Map<string, number>> {
  if (poemIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_poem_favorite_counts", {
    p_poem_ids: poemIds,
  });
  return new Map(
    (data ?? []).map((row: { poem_id: string; favorite_count: number | null }) => [
      row.poem_id,
      Number(row.favorite_count ?? 0),
    ]),
  );
}