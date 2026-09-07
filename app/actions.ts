"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Translate raw Supabase Auth errors into plain language before showing
// them to users. Unknown errors fall through unchanged.
function humanAuthError(error: { message?: string } | null | undefined): string {
  const msg = error?.message ?? "";
  if (/password should contain/i.test(msg)) {
    return "That password is too weak — mix upper and lower case letters, a number, and a symbol.";
  }
  if (/current password/i.test(msg)) {
    return "Your current password is incorrect.";
  }
  if (/reauthentication/i.test(msg)) {
    return "For security, please log out and log back in first, then retry changing your password.";
  }
  if (/nonce has expired|code.?has expired|otp.*(expired|invalid|not valid)/i.test(msg)) {
    return "That code is invalid or has expired. Go back and request a new one.";
  }
  const min = msg.match(/at least (\d+) characters/i)?.[1];
  if (min) {
    return `Password must be at least ${min} characters long.`;
  }
  if (/invalid login credentials/i.test(msg)) {
    return "Email or password is incorrect.";
  }
  if (/email not confirmed/i.test(msg)) {
    return "Please confirm your email address first — check your inbox for the confirmation link.";
  }
  if (/user already registered/i.test(msg)) {
    return "An account with this email already exists. Try logging in instead.";
  }
  return msg || "Something went wrong. Please try again.";
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(humanAuthError(error))}`);
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
    redirect(`/signup?error=${encodeURIComponent(humanAuthError(error))}`);
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

export type UniversalPoemResult = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  tags: string[] | null;
  attribution_status: string;
  poet_name_am: string;
  poet_name_en: string | null;
};

function normalizePoemResults(rows: unknown[]): UniversalPoemResult[] {
  return rows.map((row) => {
    const poem = row as Record<string, unknown>;
    const poet = poem.poets as
      | { name_am?: string; name_en?: string | null }
      | { name_am?: string; name_en?: string | null }[]
      | null
      | undefined;
    const relatedPoet = Array.isArray(poet) ? poet[0] : poet;
    return {
      id: String(poem.id),
      title: String(poem.title ?? ""),
      body: String(poem.body ?? ""),
      category: typeof poem.category === "string" ? poem.category : null,
      tags: Array.isArray(poem.tags) ? (poem.tags as string[]) : null,
      attribution_status: String(poem.attribution_status ?? "community"),
      poet_name_am: String(poem.poet_name_am ?? relatedPoet?.name_am ?? ""),
      poet_name_en:
        (poem.poet_name_en as string | null | undefined) ??
        relatedPoet?.name_en ??
        null,
    };
  });
}

export async function searchPoems(query: string): Promise<UniversalPoemResult[]> {
  const supabase = await createClient();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const escaped = escapeLike(trimmed);
  const rpcResult = await supabase.rpc("search_poems", {
    p_query: trimmed,
    p_limit: 30,
  });
  if (!rpcResult.error && rpcResult.data && rpcResult.data.length > 0) {
    return normalizePoemResults(rpcResult.data);
  }

  // Keep search functional while a new migration is waiting to be deployed.
  const { data } = await supabase
    .from("poems")
    .select(
      "id, title, body, category, tags, attribution_status, poets(name_am, name_en)",
    )
    .neq("attribution_status", "disputed")
    .or(
      `title.ilike.%${escaped}%,body.ilike.%${escaped}%,category.ilike.%${escaped}%`,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const needle = trimmed.toLocaleLowerCase();
  return normalizePoemResults(data ?? []).filter((poem) =>
    [
      poem.title,
      poem.body,
      poem.category,
      ...(poem.tags ?? []),
      poem.poet_name_am,
      poem.poet_name_en,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .includes(needle),
  );
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
  const proposedNameAm = String(
    formData.get("proposed_poet_name_am") ?? "",
  ).trim();
  const proposedNameEn = String(
    formData.get("proposed_poet_name_en") ?? "",
  ).trim();
  const proposedBio = String(formData.get("proposed_poet_bio") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  // Mirror of the poem_submissions_poet_xor check constraint: exactly one
  // of an existing poet OR a proposed new poet.
  if (!poetId && !proposedNameAm) {
    return {
      error:
        "Please select an existing poet, or add new poet details below the search box.",
    };
  }
  if (poetId && proposedNameAm) {
    return {
      error:
        "Either select an existing poet or propose a new one — not both.",
    };
  }
  if (!title) return { error: "Title is required." };
  if (!body.trim()) return { error: "Poem text is required." };
  if (!source) {
    return {
      error:
        "Source is required — it helps our moderators verify attribution.",
    };
  }

  if (poetId) {
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
  }

  const tags = tagsRaw
    ? [
        ...new Set(
          tagsRaw
            .split(/\s+/)
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ]
    : null;

  const { error } = await supabase.from("poem_submissions").insert({
    submitted_by: user.id,
    poet_id: poetId || null,
    proposed_poet_name_am: proposedNameAm || null,
    proposed_poet_name_en: proposedNameEn || null,
    proposed_poet_bio: proposedBio || null,
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

// Shared parsing/validation for the inline-editable fields on a pending
// submission card. Used by BOTH "Save edits" and "Approve", so approving
// publishes exactly what the moderator sees in the form.
function buildEditableUpdates(formData: FormData): {
  updates?: Record<string, unknown>;
  error?: string;
} {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();

  if (!title) return { error: "Title is required." };
  if (!body.trim()) return { error: "Poem text is required." };
  if (!source) return { error: "Source is required." };

  const updates: Record<string, unknown> = {
    title,
    body,
    category: category || null,
    tags: tagsRaw
      ? [
          ...new Set(
            tagsRaw
              .split(/\s+/)
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ]
      : null,
    source,
  };

  // Only proposed-poet cards render these fields; when present, keep the
  // XOR constraint intact (this row has poet_id null, so name_am must
  // stay non-empty).
  const proposedNameAmRaw = formData.get("proposed_poet_name_am");
  if (proposedNameAmRaw !== null) {
    const proposedNameAm = String(proposedNameAmRaw).trim();
    if (!proposedNameAm) {
      return { error: "Proposed poet name (Amharic) is required." };
    }
    updates.proposed_poet_name_am = proposedNameAm;
    updates.proposed_poet_name_en =
      String(formData.get("proposed_poet_name_en") ?? "").trim() || null;
    updates.proposed_poet_bio =
      String(formData.get("proposed_poet_bio") ?? "").trim() || null;
  }

  return { updates };
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
  const rawPoetId = String(formData.get("poet_id") ?? "").trim();
  if (typeof submissionId !== "string" || !submissionId) {
    return { error: "Missing submission id." };
  }
  if (attribution !== "community" && attribution !== "verified") {
    return { error: "Invalid attribution status." };
  }

  // Publish what the form shows: persist the moderator's inline edits on
  // the submission BEFORE promoting it into poems.
  const { updates, error: parseError } = buildEditableUpdates(formData);
  if (parseError || !updates) {
    return { error: parseError ?? "Invalid input." };
  }
  const { error: saveError } = await supabase
    .from("poem_submissions")
    .update(updates)
    .eq("id", submissionId);
  if (saveError) {
    return { error: `Could not save your edits: ${saveError.message}` };
  }

  // p_poet_id: the moderator's resolved poet — the submission's own poet,
  // a fuzzy-matched existing poet, or null to create the proposed poet.
  const { error } = await supabase.rpc("approve_poem_submission", {
    p_submission_id: submissionId,
    p_attribution_status: attribution,
    p_poet_id: rawPoetId || null,
  });
  if (error) {
    return { error: `Could not approve: ${error.message}` };
  }

  revalidatePath("/moderate/submissions");
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

  revalidatePath("/moderate/submissions");
  revalidatePath("/moderate");
  return { success: true };
}

export async function updateSubmission(
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
  if (typeof submissionId !== "string" || !submissionId) {
    return { error: "Missing submission id." };
  }

  const { updates, error: parseError } = buildEditableUpdates(formData);
  if (parseError || !updates) {
    return { error: parseError ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("poem_submissions")
    .update(updates)
    .eq("id", submissionId);
  if (error) {
    return { error: `Could not save edits: ${error.message}` };
  }

  revalidatePath("/moderate/submissions");
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

// Only allow same-app relative paths as redirect targets.
function internalPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function savePoetProfile(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const nameAm = String(formData.get("name_am") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!nameAm) return { error: "The poet's Amharic name is required." };

  const birthYearRaw = String(formData.get("birth_year") ?? "").trim();
  let birthYear: number | null = null;
  if (birthYearRaw) {
    const n = Number(birthYearRaw);
    if (!Number.isInteger(n) || n < 1000 || n > new Date().getFullYear()) {
      return { error: "Birth year must be a valid year." };
    }
    birthYear = n;
  }

  const { data: poetId, error } = await supabase.rpc("upsert_my_poet_profile", {
    p_name_am: nameAm,
    p_name_en: nameEn || null,
    p_birth_year: birthYear,
    p_bio: bio || null,
  });
  if (error) {
    return {
      error: error.message || "Could not save your poet details.",
    };
  }
  if (!poetId) {
    return { error: "Could not save your poet details." };
  }

  revalidatePath("/", "layout");

  // Redirect-after-save: explicit ?redirect= target wins, then the page
  // the user came from, then home. (Account settings don't route through
  // this action, so they never trigger this.)
  const target =
    internalPath(String(formData.get("redirect_to") ?? "")) ??
    internalPath(String(formData.get("came_from") ?? "")) ??
    "/";
  redirect(target);
}

export type AccountFormState = {
  error?: string;
  success?: string;
  needsCode?: boolean;
};

export async function changeEmail(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "New email is required." };

  // Relies on Supabase's built-in secure email change: confirmation links
  // go to BOTH the current and the new address.
  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { error: humanAuthError(error) };

  return {
    success:
      "Confirmation links were sent to both your current and your new email address. The change completes once confirmed.",
  };
}

// INTERIM simple password change: current + new password, no email step.
// The emailed-code verification flow (signInWithOtp → verifyOtp → update)
// is intentionally deferred until the project has a domain + custom SMTP;
// restore it then (see git history / AGENTS.md note).
export async function changePassword(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "New password is required." };

  // "Require current password when updating" is enabled in Supabase Auth,
  // so updateUser fails without it.
  const currentPassword = String(formData.get("current_password") ?? "");

  const { error } = await supabase.auth.updateUser({
    password,
    ...(currentPassword ? { current_password: currentPassword } : {}),
  });
  if (error) return { error: humanAuthError(error) };

  return { success: "Your password has been changed." };
}
