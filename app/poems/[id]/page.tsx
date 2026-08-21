import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { ReportPoem } from "@/components/report-poem";

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
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{poem.title}</h1>
          {poet?.name_am || poet?.name_en ? (
            <p className="text-zinc-600 dark:text-zinc-300">
              <Link
                href={`/poets/${poet.id}`}
                className="underline hover:text-zinc-900 dark:hover:text-white"
              >
                {poet.name_am ?? poet.name_en}
              </Link>
            </p>
          ) : null}
        </div>
        {user ? (
          <FavoriteToggle poemId={poem.id} initialFavorited={initialFavorited} />
        ) : (
          <Link
            href="/login"
            className="shrink-0 text-xs text-zinc-400 underline hover:text-zinc-600"
          >
            Log in to favorite
          </Link>
        )}
      </div>

      {poem.attribution_status === "disputed" ? (
        <div className="mb-4">
          <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
            disputed
          </span>
          <p className="mt-1 text-xs text-red-600/80">
            The attribution of this poem is under review.
          </p>
        </div>
      ) : poem.attribution_status === "community" ? (
        <span className="mb-4 inline-block rounded-full border px-2.5 py-0.5 text-xs text-zinc-400">
          community-attributed
        </span>
      ) : null}

      <div className="mb-8 whitespace-pre-wrap leading-8">
        {poem.body}
      </div>

      {poem.category ? (
        <p className="mb-2 text-sm">
          <Link
            href={`/poems?category=${encodeURIComponent(poem.category)}`}
            className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            {poem.category}
          </Link>
        </p>
      ) : null}

      {Array.isArray(poem.tags) && poem.tags.length > 0 ? (
        <p className="text-sm">
          {poem.tags.map((t: string) => (
            <Link
              key={t}
              href={`/poems?tag=${encodeURIComponent(t)}`}
              className="mr-2 text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              #{t}
            </Link>
          ))}
        </p>
      ) : null}

      {poem.source ? (
        <p className="mt-8 border-t pt-4 text-xs text-zinc-400">
          Source: {poem.source}
        </p>
      ) : (
        <div className="mt-8 border-t pt-4" />
      )}

      <div className="mt-2">
        {user ? (
          <ReportPoem poemId={poem.id} alreadyReported={alreadyReported} />
        ) : (
          <p className="text-xs text-zinc-400">
            <Link
              href="/login"
              className="underline hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Log in
            </Link>{" "}
            to report issues with this poem
          </p>
        )}
      </div>
    </article>
  );
}