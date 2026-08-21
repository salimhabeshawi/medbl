"use client";

import { useActionState } from "react";
import { approvePoetRequest, rejectPoetRequest } from "@/app/actions";

type Props = {
  id: string;
  nameAm: string;
  nameEn: string | null;
  bio: string | null;
  source: string | null;
  createdAt: string;
};

export function PoetRequestReview({
  id,
  nameAm,
  nameEn,
  bio,
  source,
  createdAt,
}: Props) {
  const [approveState, approveAction, approvePending] = useActionState(
    approvePoetRequest,
    {} as { error?: string; success?: boolean },
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectPoetRequest,
    {} as { error?: string; success?: boolean },
  );
  const done = approveState.success || rejectState.success;

  return (
    <li className="rounded-lg border p-6">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="font-semibold">
          {nameAm}
          {nameEn ? (
            <span className="ml-2 text-sm font-normal text-zinc-500">
              {nameEn}
            </span>
          ) : null}
        </h3>
        <span className="shrink-0 text-xs text-zinc-400">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
      {bio ? (
        <p className="text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
          {bio}
        </p>
      ) : null}
      {source ? (
        <p className="mt-2 text-xs text-zinc-400">Source: {source}</p>
      ) : null}

      {done ? (
        <p className="mt-4 text-sm font-medium text-green-700">
          Poet request reviewed.
        </p>
      ) : (
        <div className="mt-4 flex gap-3">
          <form action={approveAction}>
            <input type="hidden" name="request_id" value={id} />
            <button
              type="submit"
              disabled={approvePending}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
            >
              {approvePending ? "Approving…" : "Approve poet"}
            </button>
            {approveState.error ? (
              <p className="mt-2 text-sm text-red-600">{approveState.error}</p>
            ) : null}
          </form>
          <form action={rejectAction}>
            <input type="hidden" name="request_id" value={id} />
            <button
              type="submit"
              disabled={rejectPending}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {rejectPending ? "Rejecting…" : "Reject"}
            </button>
            {rejectState.error ? (
              <p className="mt-2 text-sm text-red-600">{rejectState.error}</p>
            ) : null}
          </form>
        </div>
      )}
    </li>
  );
}