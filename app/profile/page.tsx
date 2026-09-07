import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/favorites";
import { PoetDetailsForm } from "@/components/poet-details-form";
import { ChangeEmailForm } from "@/components/change-email-form";
import { ChangePasswordForm } from "@/components/change-password-form";
import { UserRound, LockKeyhole } from "lucide-react";

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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 max-w-2xl"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your place in the anthology</p><h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your profile</h1><p className="text-sm leading-7 text-muted-foreground sm:text-base">Shape how your work is represented, then manage the account behind it.</p></div>

      {redirectTo?.startsWith("/submit") ? (
        <p className="mb-8 rounded-lg border border-primary/25 bg-accent/40 px-4 py-4 text-sm leading-6 text-foreground">
          Set up your poet profile first so your poems can be properly
          attributed to you. Fill in your poet details below and you&apos;ll
          be sent back to finish your submission.
        </p>
      ) : null}

      <section className="mb-12">
        <div className="mb-5 flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="size-5" /></div><div><h2 className="text-xl font-semibold">Poet details</h2><p className="text-sm text-muted-foreground">
          Only needed if you want to submit your own poems. Saved once, then
          editable any time.
        </p></div></div>
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
        <div className="mb-5 flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"><LockKeyhole className="size-5" /></div><div><h2 className="text-xl font-semibold">Account settings</h2><p className="text-sm text-muted-foreground">
          Changes here involve an email confirmation step and stay on this
          page.
        </p></div></div>
        <div className="flex flex-col gap-6">
          <ChangeEmailForm currentEmail={user.email ?? ""} />
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}