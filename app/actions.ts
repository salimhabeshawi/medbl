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
