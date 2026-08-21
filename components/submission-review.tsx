"use client";

import { useActionState } from "react";
import { approveSubmission, rejectSubmission } from "@/app/actions";

type Props = {
  id: string;
  title: string;
  body: string;
  poetName: string;
  source: string;
  createdAt: string;
};

export function SubmissionReview({ id, title, body, poetName, source, createdAt }: Props) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveSubmission,
    {} as { error?: string; success?: boolean },
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectSubmission,
    {} as { error?: string; success?: boolean },
  );
  const done = approveState.success || rejectState.success;

  return (
    <li className="rounded-lg border p-6">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="shrink-0 text-xs text-zinc-400">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-zinc-500">
        {poetName} · Source: {source || "not provided"}
      </p>

      <div className="mt-4 rounded-md bg-zinc-50 p-4 text-sm leading-relaxed whitespace-pre-wrap dark:bg-zinc-900">
        {body}
      </div>

      {done ? (
        <p className="mt-4 text-sm font-medium text-green-700">
          Submission reviewed.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <form action={approveAction} className="flex flex-col gap-2">
            <input type="hidden" name="submission_id" value={id} />
            <label className="text-sm">
              Attribution
              <select
                name="attribution_status"
                defaultValue="community"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="community">
                  community — accepted, not independently verified
                </option>
                <option value="verified">
                  verified — confirmed against a reliable source
                </option>
              </select>
            </label>
            <button
              type="submit"
              disabled={approvePending}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
            >
              {approvePending ? "Approving…" : "Approve"}
            </button>
            {approveState.error ? (
              <p className="text-sm text-red-600">{approveState.error}</p>
            ) : null}
          </form>

          <form action={rejectAction} className="flex flex-col gap-2">
            <input type="hidden" name="submission_id" value={id} />
            <label className="text-sm">
              Rejection reason
              <input
                type="text"
                name="rejection_reason"
                required
                placeholder="Required — the submitter will see this"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </label>
            <button
              type="submit"
              disabled={rejectPending}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {rejectPending ? "Rejecting…" : "Reject"}
            </button>
            {rejectState.error ? (
              <p className="text-sm text-red-600">{rejectState.error}</p>
            ) : null}
          </form>
        </div>
      )}
    </li>
  );
}