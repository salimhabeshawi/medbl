"use client";

import { useActionState, useState, useTransition } from "react";
import { cancelMyReport, reportPoem, type FormState } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { toast } from "sonner";
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

  // Cancelling is a hard delete, so the "already reported" state is dropped
  // locally the moment the server confirms it — the report link comes straight
  // back without a page reload, matching what has_open_report() would answer on
  // the next render.
  const [cancelled, setCancelled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, startCancelling] = useTransition();

  const reported = (alreadyReported || state.success) && !cancelled;

  function confirmCancel() {
    const formData = new FormData();
    formData.set("poem_id", poemId);
    startCancelling(async () => {
      const result: FormState = await cancelMyReport({} as FormState, formData);
      if (result.error) {
        // e.g. a moderator resolved the report first — the row is no longer
        // 'open', so the delete policy refuses it.
        setCancelError(result.error);
        return;
      }
      setConfirmOpen(false);
      setCancelError(null);
      setCancelled(true);
      setOpen(false);
      setReason("");
      toast.success(tPoems("reportCancelled"));
    });
  }

  if (reported) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">
          {state.success
            ? tPoems("reportSubmittedDesc")
            : tPoems("reportSubmitted")}
        </p>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setCancelError(null);
                  setConfirmOpen(true);
                }}
                aria-label={tPoems("cancelReport")}
                className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tPoems("cancelReport")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{tPoems("cancelReportTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {tPoems("cancelReportDesc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {cancelError ? (
              <Alert variant="destructive">
                <AlertTitle>{tCommon("error")}</AlertTitle>
                <AlertDescription>{cancelError}</AlertDescription>
              </Alert>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelling}>
                {tCommon("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={cancelling}
                onClick={(event) => {
                  // Radix closes the dialog on click by default; holding it open
                  // until the server answers means a failed delete can show its
                  // reason instead of vanishing silently.
                  event.preventDefault();
                  confirmCancel();
                }}
              >
                {cancelling
                  ? tPoems("cancelReportCancelling")
                  : tPoems("cancelReportConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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