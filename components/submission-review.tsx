"use client";

import { useActionState, useState } from "react";
import {
  approveSubmission,
  rejectSubmission,
  updateSubmission,
} from "@/app/actions";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { CardHeader, CardTitle } from "./ui/card";
import { CategorySelect } from "./category-select";
import { TagInput } from "./tag-input";

type PoetMatch = {
  id: string;
  name_am: string;
  name_en: string | null;
};

type Props = {
  id: string;
  title: string;
  body: string;
  source: string;
  category: string | null;
  tags: string[] | null;
  poetId: string | null;
  poetName: string | null;
  proposal: { nameAm: string; nameEn: string | null; bio: string | null } | null;
  matches: PoetMatch[];
  createdAt: string;
  categories: string[];
};

const inputClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30";

export function SubmissionReview({
  id,
  title: initialTitle,
  body: initialBody,
  source: initialSource,
  category: initialCategory,
  tags,
  poetId,
  poetName,
  proposal,
  matches,
  createdAt,
  categories,
}: Props) {
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateSubmission,
    {} as { error?: string; success?: boolean },
  );
  const [approveState, approveFormAction, approvePending] = useActionState(
    approveSubmission,
    {} as { error?: string; success?: boolean },
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectSubmission,
    {} as { error?: string; success?: boolean },
  );

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [source, setSource] = useState(initialSource);
  const [proposedNameAm, setProposedNameAm] = useState(
    proposal?.nameAm ?? "",
  );
  const [proposedNameEn, setProposedNameEn] = useState(
    proposal?.nameEn ?? "",
  );
  const [proposedBio, setProposedBio] = useState(proposal?.bio ?? "");
  // "" = proceed as proposed (create the new poet); otherwise a matched
  // existing poet's id to use instead.
  const [matchChoice, setMatchChoice] = useState("");

  if (approveState.success || rejectState.success) {
    return (
      <li className="rounded-xl border border-secondary/30 bg-secondary/10 p-6">
        <p className="text-sm font-medium text-secondary">
          Submission reviewed.
        </p>
      </li>
    );
  }

  return (
    <li className="overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 bg-accent/20"><div className="text-xs text-muted-foreground">
        {new Date(createdAt).toLocaleDateString()}
      </div><CardTitle className="mt-1 font-serif text-xl">Review submission</CardTitle></CardHeader>

      {/* ONE shared form: every button below submits the CURRENT field
          values. "Save edits" stores them; "Approve" persists them and then
          publishes via approve_poem_submission; "Reject" ignores them. */}
      <form action={updateFormAction} className="flex flex-col gap-4">
        <input type="hidden" name="submission_id" value={id} />
        {/* Resolved poet for approval: a fuzzy match beats the proposal;
            empty lets approve_poem_submission fall back (own poet_id or
            create the proposed poet). */}
        <input
          type="hidden"
          name="poet_id"
          value={matchChoice || poetId || ""}
        />

        {poetId ? (
          <div className="text-sm">
            <span className="font-medium">Poet:</span>{" "}
            <span className="text-muted-foreground">
              {poetName ?? "Unknown poet"}
            </span>
          </div>
        ) : (
          <fieldset className="rounded-lg border border-dashed border-primary/40 bg-accent/20 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              New poet proposed
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-medium">
                Name (Amharic)
                <input
                  type="text"
                  name="proposed_poet_name_am"
                  required
                  value={proposedNameAm}
                  onChange={(e) => setProposedNameAm(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium">
                Name (English)
                <input
                  type="text"
                  name="proposed_poet_name_en"
                  value={proposedNameEn}
                  onChange={(e) => setProposedNameEn(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="mt-3 flex flex-col gap-1 text-xs font-medium">
              Bio
              <textarea
                name="proposed_poet_bio"
                rows={2}
                value={proposedBio}
                onChange={(e) => setProposedBio(e.target.value)}
                className={`whitespace-pre-wrap ${inputClass}`}
              />
            </label>

            <div className="mt-3 text-xs">
              <p className="font-medium">
                Similar existing poets
                {matches.length === 0 ? " — none found" : ":"}
              </p>
              {matches.length > 0 ? (
                <ul className="mt-1 flex flex-col gap-1">
                  <li>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="match_choice"
                        checked={matchChoice === ""}
                        onChange={() => setMatchChoice("")}
                      />
                      <span>
                        Create new poet as proposed ({" "}
                        {proposedNameAm || proposal?.nameAm} )
                      </span>
                    </label>
                  </li>
                  {matches.map((m) => (
                    <li key={m.id}>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="match_choice"
                          checked={matchChoice === m.id}
                          onChange={() => setMatchChoice(m.id)}
                        />
                        <span>
                          Use existing:{" "}
                          <strong>{m.name_am}</strong>
                          {m.name_en ? ` (${m.name_en})` : ""}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </fieldset>
        )}

        <label className="flex flex-col gap-2 text-sm font-medium">
          Title
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Poem text
          <textarea
            name="body"
            rows={10}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`whitespace-pre-wrap leading-relaxed ${inputClass}`}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Category
            <CategorySelect categories={categories} defaultValue={initialCategory ?? ""} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Tags (space separated)
            <TagInput name="tags" initialTags={tags ?? []} />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Source
          <input
            type="text"
            name="source"
            required
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={inputClass}
          />
        </label>

        <div>
          <Button
            type="submit"
            disabled={updatePending}
            variant="outline"
          >
            {updatePending ? "Saving…" : "Save edits"}
          </Button>
          <span className="ml-3 text-xs text-muted-foreground">
            Edits are stored without publishing — approving publishes exactly
            what this form shows.
          </span>
          {updateState.success ? (
            <Alert className="mt-2 border-secondary/30 bg-secondary/10 text-secondary"><AlertDescription className="text-secondary/90">Edits saved.</AlertDescription></Alert>
          ) : null}
          {updateState.error ? (
            <Alert className="mt-2" variant="destructive"><AlertDescription>{updateState.error}</AlertDescription></Alert>
          ) : null}
        </div>

        <div className="mt-2 grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
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
            <Button
              type="submit"
              formAction={approveFormAction}
              disabled={approvePending}
              variant="secondary"
            >
              {approvePending ? "Approving…" : "Approve"}
            </Button>
            {approveState.error ? (
              <Alert className="mt-2" variant="destructive"><AlertDescription>{approveState.error}</AlertDescription></Alert>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm">
              Rejection reason
              <input
                type="text"
                name="rejection_reason"
                placeholder="Required to reject — the submitter will see this"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </label>
            <Button
              type="submit"
              formAction={rejectFormAction}
              formNoValidate
              disabled={rejectPending}
              variant="destructive"
            >
              {rejectPending ? "Rejecting…" : "Reject"}
            </Button>
            {rejectState.error ? (
                <Alert className="mt-2" variant="destructive"><AlertDescription>{rejectState.error}</AlertDescription></Alert>
            ) : null}
          </div>
        </div>
      </form>
    </li>
  );
}