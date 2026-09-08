import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/favorites";
import { SubmitPoemForm } from "@/components/submit-poem-form";
import { OwnPoemForm } from "@/components/own-poem-form";
import { ArrowLeft, BookOpen, Feather, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BackLink } from "@/components/back-link";
import { type CategorySelectRecord } from "@/components/category-select";
import { getTranslations } from "next-intl/server";

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
  const tSubmit = await getTranslations("Submit");

  const supabase = await createClient();
  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id, name_am, name_en")
    .order("name_am");
  const categories = (categoryRows ?? []) as CategorySelectRecord[];

  if (type === "own") {
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
        <BackLink href="/submit">{tSubmit("selectPath")}</BackLink>
        <div className="mb-10 max-w-2xl">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tSubmit("myOwnPoem")}</h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {tSubmit("ownIntro", { poet: poet?.name_am ?? poet?.name_en ?? tSubmit("linkedPoet") })}
          </p>
        </div>
        <OwnPoemForm poetId={poetId} categories={categories} />
        <p className="mt-6 text-sm">
          <Link href="/submit" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
            <ArrowLeft className="size-4" /> {tSubmit("anotherPoetPoem")}
          </Link>
        </p>
      </div>
    );
  }

  if (type === "other") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <BackLink href="/submit">{tSubmit("selectPath")}</BackLink>
        <div className="mb-10 max-w-2xl">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tSubmit("anotherPoetPoem")}</h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {tSubmit("subtitle")}
          </p>
        </div>
        <SubmitPoemForm categories={categories} />
        <p className="mt-6 text-sm">
          <Link href="/submit" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
            <ArrowLeft className="size-4" /> {tSubmit("myOwnPoem")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tSubmit("title")}</h1>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">
          {tSubmit("subtitle")}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/submit?type=own">
          <Card className="content-card h-full border-primary/15">
            <CardContent className="space-y-5 p-6">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Feather className="size-5" />
              </div>
              <div>
                <h2 className="mb-2 font-serif text-xl">{tSubmit("myOwnPoem")}</h2>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/submit?type=other">
          <Card className="content-card h-full border-primary/15">
            <CardContent className="space-y-5 p-6">
              <div className="flex size-11 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h2 className="mb-2 font-serif text-xl">{tSubmit("anotherPoetPoem")}</h2>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="mt-8 flex items-center gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-secondary" /> {tSubmit("subtitle")}
      </div>
    </div>
  );
}