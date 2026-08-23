import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/favorites";
import { SubmitPoemForm } from "@/components/submit-poem-form";
import { OwnPoemForm } from "@/components/own-poem-form";

export const metadata: Metadata = { title: "Submit a poem" };

function param(value?: string | string[]): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

const cardClass =
  "flex flex-col gap-1 rounded-lg border p-6 text-left transition hover:shadow-sm";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const type = param((await searchParams).type);
  const supabase = await createClient();

  if (type === "own") {
    // The poet is always the caller's own linked record — resolved
    // server-side, never via form input.
    const { data: profile } = await supabase
      .from("profiles")
      .select("poet_id")
      .eq("id", user.id)
      .maybeSingle();
    const poetId = profile?.poet_id;
    if (!poetId) {
      redirect(`/profile?redirect=${encodeURIComponent("/submit?type=own")}`);
    }

    const { data: poet } = await supabase
      .from("poets")
      .select("name_am, name_en")
      .eq("id", poetId)
      .maybeSingle();

    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">Submit your own poem</h1>
        <p className="mb-8 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Submitting as{" "}
          <strong>{poet?.name_am ?? poet?.name_en ?? "your linked poet"}</strong>
          . Not you? Update your poet details on your profile.
        </p>
        <OwnPoemForm poetId={poetId} />
        <p className="mt-6 text-sm">
          <Link href="/submit" className="underline">
            ← This is actually another poet&apos;s poem
          </Link>
        </p>
      </div>
    );
  }

  if (type === "other") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">Submit another poet&apos;s poem</h1>
        <p className="mb-8 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Your poem goes to moderator review before it appears publicly —
          nothing is published instantly. Attach it to a poet already in our
          registry, or propose the poet inline if they aren&apos;t there yet.
        </p>
        <SubmitPoemForm />
        <p className="mt-6 text-sm">
          <Link href="/submit" className="underline">
            ← This is actually my own poem
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Submit a poem</h1>
      <p className="mb-8 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        Whose poem are you sharing? Either way it goes to moderator review
        first — nothing is published instantly.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/submit?type=own" className={cardClass}>
          <span className="font-semibold">This is my own poem</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            You wrote it. We&apos;ll attribute it to your poet profile — set
            one up in a minute if you haven&apos;t yet.
          </span>
        </Link>
        <Link href="/submit?type=other" className={cardClass}>
          <span className="font-semibold">This is another poet&apos;s poem</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Share work by a poet from our registry, or propose a new poet
            inline.
          </span>
        </Link>
      </div>
    </div>
  );
}