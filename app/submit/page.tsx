import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/favorites";
import { SubmitPoemForm } from "@/components/submit-poem-form";
import { OwnPoemForm } from "@/components/own-poem-form";
import { ArrowLeft, BookOpen, Feather, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Submit a poem" };

function param(value?: string | string[]): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const type = param((await searchParams).type);
  const supabase = await createClient();
  const { data: categoryRows } = await supabase
    .from("categories")
    .select("name")
    .order("name");
  const categories = (categoryRows ?? []).map((category) => category.name);

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
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your words, preserved</p>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">Submit your own poem</h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
          Submitting as{" "}
          <strong>{poet?.name_am ?? poet?.name_en ?? "your linked poet"}</strong>
          . Not you? Update your poet details on your profile.
          </p>
        </div>
        <OwnPoemForm poetId={poetId} categories={categories} />
        <p className="mt-6 text-sm">
          <Link href="/submit" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
            <ArrowLeft className="size-4" /> This is actually another poet&apos;s poem
          </Link>
        </p>
      </div>
    );
  }

  if (type === "other") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Add to the anthology</p>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">Submit another poet&apos;s poem</h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
          Your poem goes to moderator review before it appears publicly —
          nothing is published instantly. Attach it to a poet already in our
          registry, or propose the poet inline if they aren&apos;t there yet.
          </p>
        </div>
        <SubmitPoemForm categories={categories} />
        <p className="mt-6 text-sm">
          <Link href="/submit" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
            <ArrowLeft className="size-4" /> This is actually my own poem
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">A living anthology</p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">Submit a poem</h1>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">
        Whose poem are you sharing? Either way it goes to moderator review
        first — nothing is published instantly.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/submit?type=own">
          <Card className="content-card h-full border-primary/15">
            <CardContent className="space-y-5 p-6"><div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Feather className="size-5" /></div><div><h2 className="mb-2 font-serif text-xl">This is my own poem</h2><span className="text-sm leading-6 text-muted-foreground">
            You wrote it. We&apos;ll attribute it to your poet profile — set
            one up in a minute if you haven&apos;t yet.
          </span></div></CardContent>
          </Card>
        </Link>
        <Link href="/submit?type=other">
          <Card className="content-card h-full border-primary/15">
            <CardContent className="space-y-5 p-6"><div className="flex size-11 items-center justify-center rounded-full bg-secondary/15 text-secondary"><BookOpen className="size-5" /></div><div><h2 className="mb-2 font-serif text-xl">This is another poet&apos;s poem</h2><span className="text-sm leading-6 text-muted-foreground">
            Share work by a poet from our registry, or propose a new poet
            inline.
          </span></div></CardContent>
          </Card>
        </Link>
      </div>
      <div className="mt-8 flex items-center gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-secondary" /> Every submission is reviewed before publication.</div>
    </div>
  );
}