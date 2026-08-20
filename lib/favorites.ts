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