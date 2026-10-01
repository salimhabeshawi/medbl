"use client";

import { useState, useTransition } from "react";
import {
  cancelMySubmission,
  type FormState,
} from "@/app/actions";
import {
  PoemSubmissionForm,
  type SubmissionFormValues,
} from "./poem-submission-form";
import { type CategorySelectRecord } from "./category-select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { LoadingSpinner } from "@/components/loading-spinner";

/** A pending `poem_submissions` row, prepared by /my-submissions for editing. */
export type EditableSubmission = SubmissionFormValues & {
  id: string;
  /** True when `poet_id` is the submitter's own linked poet (the "own poem" path). */
  isOwnPoem: boolean;
};

/**
 * Edit + cancel actions for a single PENDING submission card.
 *
 * Both buttons are icon-only and reuse the exact variant/size/className of the
 * like/copy/share icon buttons in components/poem-actions.tsx, so no new icon
 * button style is introduced. The edit form lives in a Sheet (it is tall — title,
 * body, category, tags, source and, on the "another poet's poem" path, the whole
 * poet search/propose block) and reuses the very same PoemSubmissionForm that
 * /submit renders.
 *
 * Approved/rejected submissions never render this component at all: the actions
 * disappear the moment a moderator touches the row.
 */
export function SubmissionActions({
  submission,
  categories,
}: {
  submission: EditableSubmission;
  categories: CategorySelectRecord[];
}) {
  const tSubs = useTranslations("MySubmissions");
  const tCommon = useTranslations("Common");

  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, startCancelling] = useTransition();

  const isOwnPoem = submission.isOwnPoem;

  function confirmCancel() {
    const formData = new FormData();
    formData.set("submission_id", submission.id);
    startCancelling(async () => {
      const result: FormState = await cancelMySubmission({} as FormState, formData);
      if (result.error) {
        // e.g. a moderator got there first — the row is no longer 'pending', so
        // the delete policy refuses it.
        setCancelError(result.error);
        return;
      }
      setCancelOpen(false);
      setCancelError(null);
      toast.success(tSubs("cancelled"));
    });
  }

  return (
    <TooltipProvider>
      <div className="flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setEditOpen(true)}
              aria-label={tSubs("editSubmission")}
              className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tSubs("editSubmission")}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setCancelError(null);
                setCancelOpen(true);
              }}
              aria-label={tSubs("cancelSubmission")}
              className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tSubs("cancelSubmission")}</TooltipContent>
        </Tooltip>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pr-10">
            <SheetTitle className="font-serif text-lg">
              {tSubs("editTitle")}
            </SheetTitle>
            <SheetDescription>{tSubs("editDesc")}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <PoemSubmissionForm
              categories={categories}
              path={isOwnPoem ? "own" : "other"}
              editMode
              submissionId={submission.id}
              // "Own poem" rows keep their fixed attribution; "another poet's"
              // rows open with whatever poet the row already carries — never
              // the Folk poetry default, which only applies to a first submit.
              lockedPoetId={isOwnPoem ? (submission.poet?.id ?? null) : null}
              lockedPoet={isOwnPoem ? (submission.poet ?? null) : null}
              initialValues={submission}
              onSaved={() => {
                setEditOpen(false);
                toast.success(tCommon("editsSaved"));
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tSubs("cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tSubs("cancelDesc", { title: submission.title ?? "" })}
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
              {cancelling ? <LoadingSpinner /> : null}
              {cancelling ? tSubs("cancelling") : tSubs("cancelConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
