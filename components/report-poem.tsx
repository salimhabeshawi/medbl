"use client";

import { useActionState, useState } from "react";
import { reportPoem } from "@/app/actions";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useTranslations } from "next-intl";

export function ReportPoem({
  poemId,
  alreadyReported,
}: {
  poemId: string;
  alreadyReported: boolean;
}) {
  const tPoems = useTranslations("Poems");
  const tCommon = useTranslations("Common");

  const [state, formAction, pending] = useActionState(
    reportPoem,
    {} as { error?: string; success?: boolean },
  );
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const reported = alreadyReported || state.success;

  if (reported) {
    return (
      <p className="text-xs text-muted-foreground">
        {state.success
          ? tPoems("reportSubmittedDesc")
          : tPoems("reportSubmitted")}
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
        {tPoems("report")}
      </button>
    );
  }

  return (
    <form action={formAction} className="form-stack">
      <input type="hidden" name="poem_id" value={poemId} />
      <p className="text-xs text-muted-foreground">
        {tPoems("reportSubmittedDesc")}
      </p>
      <Textarea
        name="reason"
        required
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={tPoems("reportReasonPlaceholder")}
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
          {pending ? tCommon("loading") : tPoems("submitReport")}
        </Button>
        <Button
          type="button"
          onClick={() => setOpen(false)}
          variant="outline"
          size="sm"
        >
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}