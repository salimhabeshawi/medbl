import { createClient } from "@/lib/supabase/server";

export type UserRole = "member" | "moderator" | "admin";

export function isModerator(role: UserRole): boolean {
  return role === "moderator" || role === "admin";
}

/**
 * Server-side role lookup for the current session.
 * RLS gates the profiles read to the caller's own row (profiles_select_own),
 * which is exactly what a moderation check needs.
 */
export async function getCurrentUserWithRole(): Promise<{
  id: string;
  email?: string;
  role: UserRole;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? undefined,
    role: profile?.role ?? "member",
  };
}