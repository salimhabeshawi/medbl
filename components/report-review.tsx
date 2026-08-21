"use client";

import { useActionState } from "react";
import {
  markReportDisputed,
  removeDisputedPoem,
  republishDisputedPoem,
} from "@/app/actions";

type Props = {
  id: string;
  poemTitle: string;
  poemId: string;
  poemStatus: string;
  formerStatus: string | null;
  reason: string;
  createdAt: string;
};

export function ReportReview({
  id,
  poemTitle,
  poemId,
  poemStatus,
  formerStatus,
  reason,
  createdAt,
}: Props) {
  const [markState, markAction, markPending] = useActionState(
    markReportDisputed,
    {} as { error?: string; success?: boolean },
  );
  const [republishState, republishAction, republishPending] = useActionState(
    republishDisputedPoem,
    {} as { error?: string; success?: boolean },
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeDisputedPoem,
    {} as { error?: string; success?: boolean },
  );

  const disputed = poemStatus === "disputed";

  return (
    <li className="rounded-lg border p-6">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="font-semibold">
          Poem: <span className="font-normal">{poemTitle}</span>
          {disputed ? (
            <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 align-middle text-[11px] font-medium text-red-700">
              disputed
            </span>
          ) : null}
        </h3>
        <span className="shrink-0 text-xs text-zinc-400">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{reason}</p>

      <p className="mt-2 text-xs text-zinc-400">
        <a
          href={`/poems/${poemId}`}
          target="_blank"
          className="text-zinc-600 underline dark:text-zinc-300"
        >
          View poem
        </a>
      </p>

      {disputed ? (
        <div className="mt-4">
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            This poem is publicly flagged as disputed. Decide its fate:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <form action={republishAction}>
              <input type="hidden" name="report_id" value={id} />
              <button
                type="submit"
                disabled={republishPending}
                className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
              >
                {republishPending
                  ? "Republishing…"
                  : `Republish${formerStatus ? ` as ${formerStatus}` : ""}`}
              </button>
              {republishState.error ? (
                <p className="mt-2 text-sm text-red-600">
                  {republishState.error}
                </p>
              ) : null}
            </form>
            <form
              action={removeAction}
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    "Permanently delete this poem from the database, including all favorites and reports? This cannot be undone.",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="report_id" value={id} />
              <button
                type="submit"
                disabled={removePending}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {removePending ? "Removing…" : "Remove"}
              </button>
              {removeState.error ? (
                <p className="mt-2 text-sm text-red-600">{removeState.error}</p>
              ) : null}
            </form>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="mb-3 text-xs text-zinc-400">
            Marking as disputed adds a public red tag to the poem — it stays
            visible to everyone. You can then republish or permanently remove
            it.
          </p>
          <form action={markAction}>
            <input type="hidden" name="report_id" value={id} />
            <button
              type="submit"
              disabled={markPending}
              className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
            >
              {markPending ? "Marking…" : "Mark as disputed"}
            </button>
            {markState.error ? (
              <p className="mt-2 text-sm text-red-600">{markState.error}</p>
            ) : null}
          </form>
        </div>
      )}
    </li>
  );
}