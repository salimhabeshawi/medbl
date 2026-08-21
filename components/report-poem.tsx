"use client";

import { useActionState, useState } from "react";
import { reportPoem } from "@/app/actions";

export function ReportPoem({
  poemId,
  alreadyReported,
}: {
  poemId: string;
  alreadyReported: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    reportPoem,
    {} as { error?: string; success?: boolean },
  );
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  // `alreadyReported` comes from the has_open_report() RPC on the server and
  // is accurate across sessions and devices; state.success covers the
  // just-submitted render before the page reloads.
  const reported = alreadyReported || state.success;

  if (reported) {
    return (
      <p className="text-xs text-zinc-400">
        {state.success
          ? "Your report was received and will be reviewed by our moderators. The poem stays visible unless they act on it."
          : "You've already reported this poem."}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-400 underline hover:text-zinc-600 dark:hover:text-zinc-200"
      >
        Report this poem
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="poem_id" value={poemId} />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Use this to flag wrong attribution, a copyright concern, or another
        issue with this poem. A moderator will review your report — the poem
        is not removed automatically.
      </p>
      <textarea
        name="reason"
        required
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's wrong with this poem?"
        className="whitespace-pre-wrap rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
      />
      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border px-4 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}