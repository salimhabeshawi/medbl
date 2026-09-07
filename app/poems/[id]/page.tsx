import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { PoemActions } from "@/components/poem-actions";
import { ReportPoem } from "@/components/report-poem";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: poem } = await supabase
    .from("poems")
    .select("title")
    .eq("id", id)
    .single();
  return { title: poem?.title ?? "Poem" };
}

export default async function PoemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: poem, error } = await supabase
    .from("poems")
    .select(
      "id, title, body, category, tags, attribution_status, source, poets(id, name_am, name_en)",
    )
    .eq("id", id)
    .single();

  // Missing ids 404. Disputed poems stay readable everywhere (public red
  // tag instead of hiding).
  if (error || !poem) notFound();

  const poet = firstRelation<{
    id: string;
    name_am: string;
    name_en: string;
  }>(poem.poets);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialFavorited = false;
  let alreadyReported = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("poem_id", id)
      .maybeSingle();
    initialFavorited = Boolean(fav);

    // Members cannot read reports rows (RLS is staff-only by design), so
    // this narrow RPC answers "does the caller already have an open report
    // on this poem?" for any authenticated user, across sessions/devices.
    const { data: hasOpenReport } = await supabase.rpc("has_open_report", {
      p_poem_id: id,
    });
    alreadyReported = Boolean(hasOpenReport);
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <Card className="border border-border bg-card shadow-none">
        <CardHeader className="gap-5 border-b border-border bg-accent/45 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="mb-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {poem.title}
              </CardTitle>
              {poet?.name_am || poet?.name_en ? (
                <p className="text-sm text-secondary">
                  by{" "}
                  <Link
                    href={`/poets/${poet.id}`}
                    className="font-medium underline underline-offset-4 hover:text-primary"
                  >
                    {poet.name_am ?? poet.name_en}
                  </Link>
                </p>
              ) : null}
            </div>
            <PoemActions
              poemId={poem.id}
              title={poem.title}
              body={poem.body}
              initialFavorited={initialFavorited}
              canFavorite={Boolean(user)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {poem.attribution_status === "disputed" ? (
              <Badge variant="destructive">disputed</Badge>
            ) : poem.attribution_status === "community" ? (
              <Badge variant="secondary">community</Badge>
            ) : (
              <Badge>{poem.attribution_status}</Badge>
            )}
            {poem.category ? (
              <Badge asChild variant="outline">
                <Link href={`/poems?category=${encodeURIComponent(poem.category)}`}>
                  {poem.category}
                </Link>
              </Badge>
            ) : null}
            {Array.isArray(poem.tags)
              ? poem.tags.map((tag: string) => (
                  <Badge key={tag} asChild variant="outline">
                    <Link href={`/poems?tag=${encodeURIComponent(tag)}`}>
                      #{tag}
                    </Link>
                  </Badge>
                ))
              : null}
          </div>
          {poem.attribution_status === "disputed" ? (
            <p className="text-xs text-destructive">
              The attribution of this poem is under review.
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="whitespace-pre-wrap text-center text-lg leading-9 text-foreground">
            {poem.body}
          </div>

          <Separator className="my-8" />

          {poem.source ? (
            <p className="text-xs text-muted-foreground">
              Source: {poem.source}
            </p>
          ) : null}

          <div className="mt-4">
            {user ? (
              <ReportPoem poemId={poem.id} alreadyReported={alreadyReported} />
            ) : (
              <p className="text-xs text-muted-foreground">
                <Link href="/login" className="underline hover:text-primary">
                  Log in
                </Link>{" "}
                to report issues with this poem
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
