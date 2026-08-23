import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/favorites";
import { PoetDetailsForm } from "@/components/poet-details-form";
import { ChangeEmailForm } from "@/components/change-email-form";
import { ChangePasswordForm } from "@/components/change-password-form";

export const metadata: Metadata = { title: "Your profile" };

function internalPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const rawRedirect = Array.isArray(params.redirect)
    ? params.redirect[0]
    : params.redirect;
  const redirectTo = internalPath(rawRedirect ?? null);

  // Fallback target when no ?redirect= param exists: the page the user
  // navigated here from (Referer), else home.
  const h = await headers();
  const referer = h.get("referer");
  let cameFrom: string | null = null;
  if (referer) {
    try {
      const u = new URL(referer);
      cameFrom = internalPath(u.pathname + u.search);
    } catch {
      cameFrom = null;
    }
  }
  if (cameFrom?.startsWith("/profile")) cameFrom = null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("poet_id")
    .eq("id", user.id)
    .maybeSingle();

  let poet: {
    name_am: string;
    name_en: string | null;
    birth_year: number | null;
    bio: string | null;
  } | null = null;
  if (profile?.poet_id) {
    const { data } = await supabase
      .from("poets")
      .select("name_am, name_en, birth_year, bio")
      .eq("id", profile.poet_id)
      .maybeSingle();
    poet = data;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Your profile</h1>

      {redirectTo?.startsWith("/submit") ? (
        <p className="mb-8 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Set up your poet profile first so your poems can be properly
          attributed to you. Fill in your poet details below and you&apos;ll
          be sent back to finish your submission.
        </p>
      ) : null}

      <section className="mb-12">
        <h2 className="mb-1 text-xl font-semibold">Poet details</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Only needed if you want to submit your own poems. Saved once, then
          editable any time.
        </p>
        <PoetDetailsForm
          initial={{
            nameAm: poet?.name_am ?? "",
            nameEn: poet?.name_en ?? "",
            birthYear: poet?.birth_year != null ? String(poet.birth_year) : "",
            bio: poet?.bio ?? "",
          }}
          linked={Boolean(profile?.poet_id)}
          redirectTo={redirectTo}
          cameFrom={cameFrom ?? "/"}
        />
      </section>

      <section>
        <h2 className="mb-1 text-xl font-semibold">Account settings</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Changes here involve an email confirmation step and stay on this
          page.
        </p>
        <div className="flex flex-col gap-6">
          <ChangeEmailForm currentEmail={user.email ?? ""} />
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}