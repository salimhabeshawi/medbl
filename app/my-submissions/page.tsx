import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { getFavoriteCounts } from "@/lib/favorites";
import { optionList, type ListFilterOption } from "@/lib/filter-options";
import { EmptyState } from "@/components/empty-state";
import { ListFilters } from "@/components/list-filters";
import {
  SubmissionActions,
  type EditableSubmission,
} from "@/components/submission-actions";
import { type CategorySelectRecord } from "@/components/category-select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/back-link";
import { type ListSort } from "@/components/list-sort-select";
import { SubmissionStatusFilters } from "@/components/submission-status-filters";
import { getLocale, getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "My submissions" };

function param(value?: string | string[]): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

type SubmissionRow = {
  id: string;
  title: string;
  body: string;
  poet_id: string | null;
  proposed_poet_name_am: string | null;
  proposed_poet_name_en: string | null;
  proposed_poet_bio: string | null;
  category_id: string | null;
  tags: string[] | null;
  source: string;
  status: string;
  rejection_reason: string | null;
  published_poem_id: string | null;
  created_at: string;
  categories:
    | { name_am: string | null; name_en: string | null }[]
    | { name_am: string | null; name_en: string | null }
    | null;
  poets:
    | { name_am: string; name_en: string | null }[]
    | { name_am: string; name_en: string | null }
    | null;
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <Badge
      variant={
        status === "approved"
          ? "secondary"
          : status === "rejected"
            ? "destructive"
            : "outline"
      }
    >
      {label}
    </Badge>
  );
}

export default async function MySubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string | string[];
    poet?: string | string[];
    status?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const category = param(params.category);
  const poet = param(params.poet);
  const statusParam = param(params.status);
  const status =
    statusParam === "pending" ||
    statusParam === "approved" ||
    statusParam === "rejected"
      ? statusParam
      : "";
  const sortParam = param(params.sort);
  const sort: ListSort = [
    "date_desc",
    "date_asc",
    "alphabetical",
    "likes_desc",
    "likes_asc",
  ].includes(sortParam)
    ? (sortParam as ListSort)
    : "date_desc";
  const locale = await getLocale();
  const supabase = await createClient();
  const tSubs = await getTranslations("MySubmissions");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Every column the pending-submission edit form needs is fetched here, so the
  // sheet can be pre-filled without a second round trip per card.
  const { data, error: submissionsError } = await supabase
    .from("poem_submissions")
    .select(
      "id, title, body, poet_id, proposed_poet_name_am, proposed_poet_name_en, proposed_poet_bio, category_id, tags, source, categories(name_am, name_en), poets(name_am, name_en), status, rejection_reason, published_poem_id, created_at",
    )
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  const submissions = (data ?? []) as SubmissionRow[];
  const statusCounts = submissions.reduce(
    (counts, submission) => {
      if (submission.status === "pending") counts.pending += 1;
      if (submission.status === "approved") counts.approved += 1;
      if (submission.status === "rejected") counts.rejected += 1;
      counts[""] += 1;
      return counts;
    },
    { "": 0, pending: 0, approved: 0, rejected: 0 },
  );
  const favoriteCounts = await getFavoriteCounts(
    submissions.flatMap((submission) =>
      submission.published_poem_id ? [submission.published_poem_id] : [],
    ),
  );

  // The same bilingual category list the /submit form uses, for its required
  // category select.
  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id, name_am, name_en")
    .order("name_am");
  const categories = (categoryRows ?? []) as CategorySelectRecord[];

  // A submission whose `poet_id` is the signed-in user's own linked poet is an
  // "own poem" row: editing it must not let the attribution move. The same rule
  // is re-derived server-side in updateSubmission().
  const { data: profile } = await supabase
    .from("profiles")
    .select("poet_id")
    .eq("id", user.id)
    .maybeSingle();
  const ownPoetId = profile?.poet_id ?? null;

  // Filter options come from THIS user's submissions only — never the
  // site-wide category/poet registries. Submissions that still only propose a
  // new poet (no poet_id) are simply not offered as a poet filter value.
  const categoryOptions: ListFilterOption[] = optionList(
    submissions.map((sub) => {
      if (!sub.category_id) return null;
      const row = firstRelation<{
        name_am: string | null;
        name_en: string | null;
      }>(sub.categories);
      const label =
        locale === "am"
          ? row?.name_am || row?.name_en
          : row?.name_en || row?.name_am;
      return { id: sub.category_id, label: label || sub.category_id };
    }),
  );
  const poetOptions: ListFilterOption[] = optionList(
    submissions.map((sub) => {
      if (!sub.poet_id) return null;
      const row = firstRelation<{ name_am: string; name_en: string | null }>(
        sub.poets,
      );
      return {
        id: sub.poet_id,
        label: row?.name_am || row?.name_en || tSubs("unknownPoet"),
      };
    }),
  );

  // The two filters combine (category AND poet) when both are set; both live
  // in the URL so the filtered view survives a refresh and is shareable.
  const filteredSubmissions = submissions.filter(
    (sub) =>
      (!category || sub.category_id === category) &&
      (!poet || sub.poet_id === poet) &&
      (!status || sub.status === status),
  );
  const sortedSubmissions = [...filteredSubmissions].sort((left, right) => {
    if (sort === "alphabetical") return left.title.localeCompare(right.title);
    if (sort === "likes_desc" || sort === "likes_asc") {
      const leftLikes = left.published_poem_id
        ? (favoriteCounts.get(left.published_poem_id) ?? 0)
        : 0;
      const rightLikes = right.published_poem_id
        ? (favoriteCounts.get(right.published_poem_id) ?? 0)
        : 0;
      return sort === "likes_desc"
        ? rightLikes - leftLikes
        : leftLikes - rightLikes;
    }
    const leftDate = new Date(left.created_at).getTime();
    const rightDate = new Date(right.created_at).getTime();
    return sort === "date_asc" ? leftDate - rightDate : rightDate - leftDate;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <BackLink fallbackHref="/">{tSubs("back")}</BackLink>
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {tSubs("eyebrow")}
        </p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {tSubs("title")}
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          {tSubs("subtitle")}
        </p>
      </div>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-semibold">
          {tSubs("sectionTitle")}
        </h2>
        <Link
          href="/submit"
          className="mb-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          {tSubs("submitNew")}
        </Link>
        {submissionsError ? (
          <EmptyState
            title={tSubs("errorTitle")}
            description={submissionsError.message}
          />
        ) : submissions.length === 0 ? (
          <EmptyState
            title={tSubs("emptyTitle")}
            description={tSubs("emptyDesc")}
          />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <SubmissionStatusFilters
                value={status}
                counts={statusCounts}
                className="flex flex-wrap gap-2"
              />
              <ListFilters
                categoryOptions={categoryOptions}
                poetOptions={poetOptions}
                categoryValue={category}
                poetValue={poet}
                sortValue={sort}
                sortOptions={[
                  "date_desc",
                  "date_asc",
                  "alphabetical",
                  "likes_desc",
                  "likes_asc",
                ]}
                className="mb-0"
              />
            </div>
            {sortedSubmissions.length === 0 ? (
              <EmptyState
                title={tSubs("noMatchTitle")}
                description={tSubs("noMatchDesc")}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {sortedSubmissions.map((sub) => {
                  const poet = firstRelation<{
                    name_am: string;
                    name_en: string | null;
                  }>(sub.poets);
                  // Everything the edit sheet needs, pre-computed here so the
                  // client component stays a dumb renderer.
                  const editable: EditableSubmission = {
                    id: sub.id,
                    isOwnPoem:
                      Boolean(sub.poet_id) && sub.poet_id === ownPoetId,
                    title: sub.title,
                    body: sub.body,
                    categoryId: sub.category_id,
                    tags: sub.tags,
                    source: sub.source,
                    poet: sub.poet_id
                      ? {
                          id: sub.poet_id,
                          name_am: poet?.name_am ?? tSubs("unknownPoet"),
                          name_en: poet?.name_en ?? null,
                        }
                      : null,
                    proposedNameAm: sub.proposed_poet_name_am,
                    proposedNameEn: sub.proposed_poet_name_en,
                    proposedBio: sub.proposed_poet_bio,
                  };
                  const card = (
                    <Card className="border-primary/15 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium">{sub.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {sub.proposed_poet_name_am
                                ? tSubs("proposedPoet", {
                                    name: sub.proposed_poet_name_am,
                                  })
                                : (poet?.name_am ??
                                  poet?.name_en ??
                                  tSubs("unknownPoet"))}{" "}
                              · {new Date(sub.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge
                              status={sub.status}
                              label={
                                sub.status === "approved"
                                  ? tSubs("approved")
                                  : sub.status === "rejected"
                                    ? tSubs("rejected")
                                    : tSubs("pending")
                              }
                            />
                            {/* Edit and cancel exist only while the row is still
                              pending — an approved/rejected card is read-only. */}
                            {sub.status === "pending" ? (
                              <SubmissionActions
                                submission={editable}
                                categories={categories}
                              />
                            ) : null}
                          </div>
                        </div>
                        {sub.status === "rejected" && sub.rejection_reason ? (
                          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {tSubs("reason")}: {sub.rejection_reason}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                  return sub.status === "approved" && sub.published_poem_id ? (
                    <Link
                      key={sub.id}
                      href={`/poems/${sub.published_poem_id}`}
                      className="block"
                    >
                      {card}
                    </Link>
                  ) : (
                    <div key={sub.id}>{card}</div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
