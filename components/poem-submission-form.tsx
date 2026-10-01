"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  submitPoem,
  updateMySubmission,
  type FormState,
  type PoetResult,
} from "@/app/actions";
import { PoetSelect } from "./poet-select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { CategorySelect, type CategorySelectRecord } from "./category-select";
import { TagInput } from "./tag-input";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, ClipboardList, Lock } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

/** Everything the form needs to pre-fill itself from an existing row. */
export type SubmissionFormValues = {
  title?: string | null;
  body?: string | null;
  categoryId?: string | null;
  tags?: string[] | null;
  source?: string | null;
  poet?: PoetResult | null;
  proposedNameAm?: string | null;
  proposedNameEn?: string | null;
  proposedBio?: string | null;
};

/**
 * The one and only poem-submission form. Both `/submit` paths and the pending
 * edit form on `/my-submissions` render this, so the field set, the mandatory
 * category rule, the poet/proposed-poet XOR and the locked "own poem" source
 * can never drift apart between creating and editing a submission.
 *
 * - `path: "own"`   — the submitter IS the poet. Attribution comes from their
 *   linked poet record and is not editable; `source` is the fixed bilingual
 *   "Personal knowledge" constant and stays disabled.
 * - `path: "other"` — another poet's poem. Full poet search / select / propose
 *   UI, plus a free-text `source`.
 * - `editMode`      — updates the existing `poem_submissions` row in place
 *   (via `updateMySubmission`) instead of inserting a new one, hides the
 *   inter-path switch link, and reports success through `onSaved` instead of
 *   replacing the form with a success screen.
 */
export function PoemSubmissionForm({
  categories,
  path,
  editMode = false,
  submissionId,
  defaultPoet = null,
  lockedPoetId = null,
  lockedPoet = null,
  initialValues,
  onSaved,
}: {
  categories: CategorySelectRecord[];
  path: "own" | "other";
  editMode?: boolean;
  /** Required in edit mode: the `poem_submissions` row being updated. */
  submissionId?: string;
  /** Pre-selected poet for a brand-new "another poet's poem" (Folk poetry). */
  defaultPoet?: PoetResult | null;
  /** The submitter's own poet id, submitted as a hidden field on the own path. */
  lockedPoetId?: string | null;
  /** Display-only name for that poet; omit to hide the read-only poet field. */
  lockedPoet?: PoetResult | null;
  initialValues?: SubmissionFormValues;
  onSaved?: () => void;
}) {
  const tSubmit = useTranslations("Submit");
  const tCommon = useTranslations("Common");

  const [state, formAction, pending] = useActionState(
    editMode ? updateMySubmission : submitPoem,
    {} as FormState,
  );

  const isOwn = path === "own";

  // Starts on the default (Folk poetry) poet on a new "another poet's poem", or
  // on whatever the row already carries when editing. Any explicit
  // search/selection below replaces it.
  const [selectedPoet, setSelectedPoet] = useState<PoetResult | null>(
    isOwn ? lockedPoet : (initialValues?.poet ?? defaultPoet),
  );
  const [proposeMode, setProposeMode] = useState(
    Boolean(initialValues?.proposedNameAm),
  );
  const [proposedNameAm, setProposedNameAm] = useState(
    initialValues?.proposedNameAm ?? "",
  );
  const [proposedNameEn, setProposedNameEn] = useState(
    initialValues?.proposedNameEn ?? "",
  );
  const [proposedBio, setProposedBio] = useState(
    initialValues?.proposedBio ?? "",
  );
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [source, setSource] = useState(initialValues?.source ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  // In edit mode there is no success screen to replace the form: the host sheet
  // closes itself and toasts once the server confirms the save. Guarded by a
  // ref so an inline `onSaved` identity change cannot fire it twice.
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!editMode || !state.success || notifiedRef.current) return;
    notifiedRef.current = true;
    onSaved?.();
  }, [editMode, state.success, onSaved]);

  function clearProposal() {
    setProposeMode(false);
    setProposedNameAm("");
    setProposedNameEn("");
    setProposedBio("");
  }

  function handlePoetChange(poet: PoetResult | null) {
    setSelectedPoet(poet);
    if (poet) {
      clearProposal();
      setClientError(null);
    }
  }

  function togglePropose() {
    if (!proposeMode) {
      setSelectedPoet(null);
      setClientError(null);
    }
    setProposeMode((v) => !v);
  }

  // The dropdown's "can't find the poet?" option must go through the same path
  // as the toggle button: entering propose mode has to clear any selected poet
  // (including the pre-selected Folk poetry default), otherwise poet_id and the
  // proposed fields would both be set and trip the poet_selection_conflict
  // validation.
  function startPropose() {
    if (!proposeMode) togglePropose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Category is mandatory (poem_submissions.category_id is NOT NULL) on both
    // paths and in both create and edit mode, with the message shown by the
    // field itself.
    if (!categoryId) {
      e.preventDefault();
      setCategoryError(tSubmit("categoryRequired"));
      return;
    }
    setCategoryError(null);

    // The "own poem" path has no poet input to validate: the attribution is the
    // submitter's own locked poet record.
    if (isOwn) return;

    const hasPoet = Boolean(selectedPoet);
    const hasProposal = proposedNameAm.trim().length > 0;
    if (!hasPoet && !hasProposal) {
      e.preventDefault();
      setClientError(tSubmit("poetSelectionRequired"));
      return;
    }
    if (hasPoet && hasProposal) {
      e.preventDefault();
      setClientError(tSubmit("poetSelectionConflict"));
      return;
    }
    setClientError(null);
  }

  // On the "this is my own poem" path the source is not user-supplied: it is
  // fixed to a localized constant and the field is disabled. Because a disabled
  // input is never submitted by the browser, the real `source` value is carried
  // by a hidden input alongside it. When editing an existing row we show the
  // value actually stored on it; updateSubmission ignores this field for
  // own-poem rows either way, so the stored source is never rewritten.
  const ownSource = isOwn
    ? (initialValues?.source ?? tSubmit("ownSourceValue"))
    : "";

  if (state.success && !editMode) {
    return (
      <div className="space-y-6">
        <Alert className="border-secondary/30 bg-secondary/10 text-secondary">
          <AlertTitle>{tSubmit("successTitle")}</AlertTitle>
          <AlertDescription className="text-secondary/90">
            {tSubmit("successDesc")}
          </AlertDescription>
        </Alert>
        <p className="text-sm">
          <Link
            href="/my-submissions"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <ClipboardList className="size-4" /> {tSubmit("viewMySubmission")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      {editMode && submissionId ? (
        <input type="hidden" name="submission_id" value={submissionId} />
      ) : null}
      {isOwn ? (
        <>
          <input type="hidden" name="submission_mode" value="own" />
          <input type="hidden" name="source" value={ownSource} />
          <input
            type="hidden"
            name="poet_id"
            value={lockedPoetId ?? lockedPoet?.id ?? ""}
          />
        </>
      ) : null}

      {(clientError ?? state.error) ? (
        <Alert variant="destructive">
          <AlertTitle>{tCommon("error")}</AlertTitle>
          <AlertDescription>{clientError ?? state.error}</AlertDescription>
        </Alert>
      ) : null}

      {editMode && isOwn && lockedPoet ? (
        <p className="flex items-start gap-2 rounded-lg bg-accent/40 px-3 py-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{tSubmit("ownAttributionFixedNote")}</span>
        </p>
      ) : null}

      {isOwn ? null : (
        <Card className="relative z-30 overflow-visible border-primary/15 shadow-sm">
          <CardHeader className="border-b border-border/70 bg-accent/20">
            <CardTitle className="font-serif text-xl">
              {tSubmit("poetSelection")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <label className="space-y-2 text-sm font-medium">
              <span>{tSubmit("poetSelection")}</span>
              <div className="mt-2 mb-4">
                <PoetSelect
                  value={selectedPoet}
                  onChange={handlePoetChange}
                  onRequestNew={startPropose}
                />
                {defaultPoet && selectedPoet?.id === defaultPoet.id ? (
                  <p className="mt-2 text-xs font-normal text-muted-foreground">
                    {tSubmit("folkPoetDefaultNote")}
                  </p>
                ) : null}
              </div>
            </label>
            <button
              type="button"
              onClick={togglePropose}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {tSubmit("proposePoetToggle")}
            </button>
            {proposeMode ? (
              <div className="space-y-4 rounded-lg border border-dashed border-primary/40 bg-accent/20 p-4">
                <label className="space-y-2 text-sm font-medium">
                  <span>
                    {tSubmit("proposedNameAm")}{" "}
                    <span className="text-destructive">*</span>
                  </span>
                  <Input
                    type="text"
                    name="proposed_poet_name_am"
                    required
                    autoComplete="off"
                    value={proposedNameAm}
                    onChange={(e) => setProposedNameAm(e.target.value)}
                    placeholder={tSubmit("proposedNameAmPlaceholder")}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>{tSubmit("proposedNameEn")}</span>
                  <Input
                    type="text"
                    name="proposed_poet_name_en"
                    autoComplete="off"
                    value={proposedNameEn}
                    onChange={(e) => setProposedNameEn(e.target.value)}
                    placeholder={tSubmit("proposedNameEnPlaceholder")}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>{tSubmit("proposedBio")}</span>
                  <Textarea
                    name="proposed_poet_bio"
                    rows={3}
                    value={proposedBio}
                    onChange={(e) => setProposedBio(e.target.value)}
                    placeholder={tSubmit("proposedBioPlaceholder")}
                  />
                </label>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card className="relative z-0 border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <CardTitle className="font-serif text-xl">
            {tSubmit("poemDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {isOwn && lockedPoet ? (
            <label className="block space-y-2 text-sm font-medium">
              <span>{tCommon("poet")}</span>
              <Input
                type="text"
                value={`${lockedPoet.name_am}${lockedPoet.name_en ? ` (${lockedPoet.name_en})` : ""}`}
                disabled
                readOnly
                aria-readonly="true"
                className="mt-2"
              />
            </label>
          ) : null}
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("poemTitle")}</span>
            <Input
              type="text"
              name="title"
              required
              autoComplete="off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tSubmit("poemTitlePlaceholder")}
              className="mt-2 mb-4"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("poemBody")}</span>
            <Textarea
              name="body"
              required
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={tSubmit("poemBodyPlaceholder")}
              className="min-h-64 whitespace-pre-wrap leading-relaxed mt-2"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium mt-4">
              <span>{tSubmit("category")}</span>
              <div className="mt-2">
                <CategorySelect
                  categories={categories}
                  required
                  invalid={Boolean(categoryError)}
                  value={categoryId}
                  onValueChange={(next) => {
                    setCategoryId(next);
                    setCategoryError(null);
                  }}
                />
              </div>
              {categoryError ? (
                <p className="font-normal text-destructive" role="alert">
                  {categoryError}
                </p>
              ) : null}
            </label>
            <label className="space-y-2 text-sm font-medium mt-4">
              <span>{tSubmit("tags")}</span>
              <div className="mt-2">
                <TagInput initialTags={initialValues?.tags ?? []} />
              </div>
            </label>
          </div>
          {isOwn ? (
            <label className="space-y-2 text-sm font-medium">
              <span>{tSubmit("source")}</span>
              <Input
                type="text"
                value={ownSource}
                disabled
                readOnly
                aria-readonly="true"
                className="mt-2"
              />
              <p className="mt-2 text-xs font-normal text-muted-foreground">
                {tSubmit("ownSourceFixedNote")}
              </p>
            </label>
          ) : (
            <label className="space-y-2 text-sm font-medium">
              <span>{tSubmit("source")}</span>
              <Input
                type="text"
                name="source"
                required
                autoComplete="off"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder={tSubmit("sourcePlaceholder")}
                className="mt-2"
              />
            </label>
          )}
          <p className="text-sm text-muted-foreground mt-10">
            {tSubmit("termsNoticePrefix")}{" "}
            <Link href="/terms" className="text-primary underline">
              {tSubmit("termsLink")}
            </Link>
            .
          </p>
          <Button
            type="submit"
            disabled={pending}
            size="lg"
            className="w-full sm:w-auto"
          >
            {pending ? <LoadingSpinner /> : null}
            {pending
              ? editMode
                ? tCommon("saving")
                : tSubmit("submitting")
              : editMode
                ? tCommon("saveEdits")
                : tSubmit("submitBtn")}
          </Button>
          {/* Switching submission paths only makes sense while creating, so the
              link is left out entirely in edit mode. */}
          {editMode ? null : (
            <p className="pt-2 text-sm">
              <Link
                href={isOwn ? "/submit?type=other" : "/submit?type=own"}
                className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />{" "}
                {isOwn ? tSubmit("anotherPoetPoem") : tSubmit("myOwnPoem")}
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
