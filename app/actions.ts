"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");

  if (signUpData.user?.identities?.length === 0) {
    // GoTrue returns success (no error) for an existing email and signals it
    // with an empty identities array, to avoid leaking account existence.
    redirect(
      `/signup?error=${encodeURIComponent("User already registered.")}`,
    );
  }

  if (signUpData.session === null) {
    // Email confirmation is enabled: the profile row is created by the
    // on_auth_user_created trigger when the user confirms, so just tell
    // them to check their inbox.
    redirect(
      `/login?message=${encodeURIComponent(
        "Account created. Check your email to confirm before logging in.",
      )}`,
    );
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function toggleFavorite(
  poemId: string,
): Promise<{ favorited: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { favorited: false, error: "You must be logged in." };
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("poem_id", poemId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) {
      return {
        favorited: true,
        error: "Could not remove favorite. Please try again.",
      };
    }
    return { favorited: false };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, poem_id: poemId });
  if (error) {
    if (error.code === "23505") {
      // Duplicate key — already favorited (fast double-click race). Treat as success.
      return { favorited: true };
    }
    return {
      favorited: false,
      error: "Could not add favorite. Please try again.",
    };
  }
  return { favorited: true };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export type PoetResult = {
  id: string;
  name_am: string;
  name_en: string | null;
};

export async function searchPoets(
  query: string,
): Promise<PoetResult[]> {
  const supabase = await createClient();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const escaped = escapeLike(trimmed);
  const { data } = await supabase
    .from("poets")
    .select("id, name_am, name_en")
    .or(`name_am.ilike.%${escaped}%,name_en.ilike.%${escaped}%`)
    .order("name_am")
    .limit(8);

  return (data ?? []).map((p) => ({
    id: p.id,
    name_am: p.name_am,
    name_en: p.name_en ?? null,
  }));
}

export type FormState = { error?: string; success?: boolean };

export async function submitPoem(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const poetId = String(formData.get("poet_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  if (!poetId) {
    return { error: "Please select a poet from the list." };
  }
  if (!title) return { error: "Title is required." };
  if (!body.trim()) return { error: "Poem text is required." };
  if (!source) {
    return {
      error:
        "Source is required — it helps our moderators verify attribution.",
    };
  }

  // The poet_id always comes from the search-and-select control, but we
  // re-validate it server-side: it must reference an existing poet row.
  const { data: poet } = await supabase
    .from("poets")
    .select("id")
    .eq("id", poetId)
    .maybeSingle();
  if (!poet) {
    return {
      error:
        "Selected poet no longer exists. Please pick one from the list again.",
    };
  }

  const tags = tagsRaw
    ? [
        ...new Set(
          tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ]
    : null;

  const { error } = await supabase.from("poem_submissions").insert({
    submitted_by: user.id,
    poet_id: poet.id,
    title,
    body,
    category: category || null,
    tags,
    source,
  });

  if (error) {
    return { error: "Could not submit your poem. Please try again." };
  }
  return { success: true };
}

function requireModeratorRole(role: string | null | undefined) {
  return role === "moderator" || role === "admin";
}

export async function approveSubmission(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!requireModeratorRole(profile?.role)) {
    return { error: "You are not authorized to moderate." };
  }

  const submissionId = formData.get("submission_id");
  const attribution = formData.get("attribution_status");
  if (typeof submissionId !== "string" || !submissionId) {
    return { error: "Missing submission id." };
  }
  if (attribution !== "community" && attribution !== "verified") {
    return { error: "Invalid attribution status." };
  }

  const { error } = await supabase.rpc("approve_poem_submission", {
    p_submission_id: submissionId,
    p_attribution_status: attribution,
  });
  if (error) {
    return { error: `Could not approve: ${error.message}` };
  }

  revalidatePath("/moderate");
  return { success: true };
}

export async function rejectSubmission(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!requireModeratorRole(profile?.role)) {
    return { error: "You are not authorized to moderate." };
  }

  const submissionId = formData.get("submission_id");
  const reason = String(formData.get("rejection_reason") ?? "").trim();
  if (typeof submissionId !== "string" || !submissionId) {
    return { error: "Missing submission id." };
  }
  if (!reason) {
    return { error: "A rejection reason is required." };
  }

  const { error } = await supabase
    .from("poem_submissions")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_by: user.id,
    })
    .eq("id", submissionId);
  if (error) {
    return { error: `Could not reject: ${error.message}` };
  }

  revalidatePath("/moderate");
  return { success: true };
}

export async function approvePoetRequest(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!requireModeratorRole(profile?.role)) {
    return { error: "You are not authorized to moderate." };
  }

  const requestId = formData.get("request_id");
  if (typeof requestId !== "string" || !requestId) {
    return { error: "Missing request id." };
  }

  const { data: request, error: fetchError } = await supabase
    .from("poet_requests")
    .select("id, requested_by, name_am, name_en, bio, status")
    .eq("id", requestId)
    .single();
  if (fetchError || !request) {
    return { error: "Could not find that poet request." };
  }
  if (request.status !== "pending") {
    return { error: "This request has already been reviewed." };
  }

  const poetInsert = await supabase.from("poets").insert({
    name_am: request.name_am,
    name_en: request.name_en,
    bio: request.bio,
    verified: false,
    created_by: request.requested_by,
  });
  if (poetInsert.error) {
    return { error: `Could not create poet: ${poetInsert.error.message}` };
  }

  const { error: updateError } = await supabase
    .from("poet_requests")
    .update({ status: "approved", reviewed_by: user.id })
    .eq("id", requestId);
  if (updateError) {
    return { error: `Poet created, but could not mark request approved: ${updateError.message}` };
  }

  revalidatePath("/moderate");
  return { success: true };
}

export async function rejectPoetRequest(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!requireModeratorRole(profile?.role)) {
    return { error: "You are not authorized to moderate." };
  }

  const requestId = formData.get("request_id");
  if (typeof requestId !== "string" || !requestId) {
    return { error: "Missing request id." };
  }

  const { error } = await supabase
    .from("poet_requests")
    .update({ status: "rejected", reviewed_by: user.id })
    .eq("id", requestId);
  if (error) {
    return { error: `Could not reject: ${error.message}` };
  }

  revalidatePath("/moderate");
  return { success: true };
}

export async function markReportDisputed(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!requireModeratorRole(profile?.role)) {
    return { error: "You are not authorized to moderate." };
  }

  const reportId = formData.get("report_id");
  if (typeof reportId !== "string" || !reportId) {
    return { error: "Missing report id." };
  }

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("id, poem_id, status")
    .eq("id", reportId)
    .single();
  if (fetchError || !report) {
    return { error: "Could not find that report." };
  }
  if (report.status !== "open") {
    return { error: "This report has already been resolved." };
  }

  const { data: poem, error: poemFetchError } = await supabase
    .from("poems")
    .select("id, attribution_status")
    .eq("id", report.poem_id)
    .maybeSingle();
  if (poemFetchError || !poem) {
    return { error: "The reported poem no longer exists." };
  }
  if (poem.attribution_status === "disputed") {
    return { error: "This poem is already marked as disputed." };
  }

  const former = poem.attribution_status; // 'verified' | 'community'

  const { error: disputeError } = await supabase
    .from("poems")
    .update({ attribution_status: "disputed" })
    .eq("id", poem.id);
  if (disputeError) {
    return { error: `Could not mark the poem as disputed: ${disputeError.message}` };
  }

  // Stamp every open report on this poem so any of its cards can later
  // republish with the correct former tag.
  await supabase
    .from("reports")
    .update({ former_attribution_status: former })
    .eq("poem_id", poem.id)
    .eq("status", "open");

  revalidatePath("/moderate");
  revalidatePath("/poems");
  revalidatePath("/");
  return { success: true };
}

export async function republishDisputedPoem(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!requireModeratorRole(profile?.role)) {
    return { error: "You are not authorized to moderate." };
  }

  const reportId = formData.get("report_id");
  if (typeof reportId !== "string" || !reportId) {
    return { error: "Missing report id." };
  }

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("id, poem_id, status, former_attribution_status")
    .eq("id", reportId)
    .single();
  if (fetchError || !report) {
    return { error: "Could not find that report." };
  }
  if (report.status !== "open") {
    return { error: "This report has already been resolved." };
  }

  const { data: poem, error: poemFetchError } = await supabase
    .from("poems")
    .select("id, attribution_status")
    .eq("id", report.poem_id)
    .maybeSingle();
  if (poemFetchError || !poem) {
    return { error: "The poem no longer exists." };
  }
  if (poem.attribution_status !== "disputed") {
    return { error: "This poem is not currently disputed." };
  }

  const restoreTo = report.former_attribution_status ?? "community";
  const { error: restoreError } = await supabase
    .from("poems")
    .update({ attribution_status: restoreTo })
    .eq("id", poem.id);
  if (restoreError) {
    return { error: `Could not republish the poem: ${restoreError.message}` };
  }

  const { error: resolveError } = await supabase
    .from("reports")
    .update({ status: "resolved", resolved_by: user.id })
    .eq("id", reportId);
  if (resolveError) {
    return { error: `Poem republished, but could not resolve the report: ${resolveError.message}` };
  }

  revalidatePath("/moderate");
  revalidatePath("/poems");
  revalidatePath("/");
  return { success: true };
}

export async function removeDisputedPoem(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!requireModeratorRole(profile?.role)) {
    return { error: "You are not authorized to moderate." };
  }

  const reportId = formData.get("report_id");
  if (typeof reportId !== "string" || !reportId) {
    return { error: "Missing report id." };
  }

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("id, poem_id, status")
    .eq("id", reportId)
    .single();
  if (fetchError || !report) {
    return { error: "Could not find that report." };
  }
  if (report.status !== "open") {
    return { error: "This report has already been resolved." };
  }

  const { data: poem, error: poemFetchError } = await supabase
    .from("poems")
    .select("id, attribution_status")
    .eq("id", report.poem_id)
    .maybeSingle();
  if (poemFetchError || !poem) {
    return { error: "The poem no longer exists." };
  }
  if (poem.attribution_status !== "disputed") {
    return { error: "Only a disputed poem can be removed. Mark it disputed first." };
  }

  // Favorites and reports cascade-delete with the poem.
  const { error: deleteError } = await supabase
    .from("poems")
    .delete()
    .eq("id", poem.id);
  if (deleteError) {
    return { error: `Could not remove the poem: ${deleteError.message}` };
  }

  revalidatePath("/moderate");
  revalidatePath("/poems");
  revalidatePath("/");
  return { success: true };
}

export async function submitPoetRequest(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const name_am = String(formData.get("name_am") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  if (!name_am) return { error: "የገጣሚው ስም (Amharic name) is required." };

  const { error } = await supabase.from("poet_requests").insert({
    requested_by: user.id,
    name_am,
    name_en: name_en || null,
    bio: bio || null,
    source: source || null,
  });

  if (error) {
    return { error: "Could not submit your request. Please try again." };
  }
  return { success: true };
}

export async function reportPoem(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const poemId = String(formData.get("poem_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!poemId) return { error: "Missing poem." };
  if (!reason) return { error: "Please describe the problem with this poem." };
  if (reason.length > 2000) {
    return { error: "Please keep the reason under 2000 characters." };
  }

  // The poem must exist and be visible to the reporter. Disputed poems are
  // hidden from members by RLS, so they cannot report what they cannot see.
  const { data: poem } = await supabase
    .from("poems")
    .select("id")
    .eq("id", poemId)
    .maybeSingle();
  if (!poem) return { error: "This poem can no longer be found." };

  // Cross-session dedup is enforced by a partial unique index on
  // reports(poem_id, reported_by) where status = 'open'; a duplicate lands
  // here as a 23505 unique violation.
  const { error } = await supabase.from("reports").insert({
    poem_id: poemId,
    reported_by: user.id,
    reason,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already reported this poem." };
    }
    return { error: "Could not submit your report. Please try again." };
  }
  return { success: true };
}
