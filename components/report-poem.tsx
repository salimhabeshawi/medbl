"use client";

import { useActionState, useState } from "react";
import { reportPoem } from "@/app/actions";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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
      <p className="text-xs text-muted-foreground">
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
        className="text-xs text-muted-foreground underline hover:text-foreground"
      >
        Report this poem
      </button>
    );
  }

  return (
    <form action={formAction} className="form-stack">
      <input type="hidden" name="poem_id" value={poemId} />
      <p className="text-xs text-muted-foreground">
        Use this to flag wrong attribution, a copyright concern, or another
        issue with this poem. A moderator will review your report — the poem
        is not removed automatically.
      </p>
      <Textarea
        name="reason"
        required
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's wrong with this poem?"
        className="whitespace-pre-wrap"
      />
      {state.error ? (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending}
          size="sm"
        >
          {pending ? "Sending…" : "Send report"}
        </Button>
        <Button
          type="button"
          onClick={() => setOpen(false)}
          variant="outline"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}