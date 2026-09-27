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

export type ModerationPendingCounts = {
  pendingSubmissions: number;
  openReports: number;
};

/**
 * Total pending submissions + open reports, for the header's notification dot
 * on the Moderation link.
 *
 * Wraps the staff-only get_moderation_pending_counts() RPC so the dot never
 * needs row-level access to the moderation queue — poem_submissions and
 * reports stay unreadable to members, and this returns counts only.
 *
 * The function body is gated on `where public.is_staff()`, so a non-staff
 * caller gets ZERO ROWS back rather than an error, which PostgREST surfaces as
 * an empty array. That is deliberately not an error state here: the caller
 * only ever renders the dot on the staff-only nav link, so "no rows" means
 * "nothing to show" and must never surface anything to the user. Any
 * transport error is swallowed for the same reason — a missing notification
 * dot is never worth breaking the header over.
 */
export async function getModerationPendingCounts(): Promise<ModerationPendingCounts | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_moderation_pending_counts");

  if (error || !data || data.length === 0) return null;

  const row = data[0] as {
    pending_submissions: number | string | null;
    open_reports: number | string | null;
  };

  return {
    // bigint columns arrive as JSON numbers, but Number() also covers a
    // serialized string, matching the defensive cast in lib/favorites.ts.
    pendingSubmissions: Number(row.pending_submissions ?? 0),
    openReports: Number(row.open_reports ?? 0),
  };
}

/**
 * Whether a moderator has anything waiting. `null` counts (non-staff caller,
 * or the RPC failing) mean "no dot" — never an error.
 */
export function hasPendingModeration(
  counts: ModerationPendingCounts | null,
): boolean {
  if (!counts) return false;
  return counts.pendingSubmissions + counts.openReports > 0;
}