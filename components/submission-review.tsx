"use client";

import { useActionState, useState } from "react";
import {
  approveSubmission,
  rejectSubmission,
  updateSubmission,
} from "@/app/actions";

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
};

const inputClass =
  "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400";

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
  const [category, setCategory] = useState(initialCategory ?? "");
  const [tagsText, setTagsText] = useState((tags ?? []).join(", "));
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
      <li className="rounded-lg border p-6">
        <p className="text-sm font-medium text-green-700">
          Submission reviewed.
        </p>
      </li>
    );
  }

  return (
    <li className="rounded-lg border p-6">
      <div className="mb-4 text-xs text-zinc-400">
        {new Date(createdAt).toLocaleDateString()}
      </div>

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
            <span className="text-zinc-600 dark:text-zinc-300">
              {poetName ?? "Unknown poet"}
            </span>
          </div>
        ) : (
          <fieldset className="rounded-md border border-dashed p-4">
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

        <label className="flex flex-col gap-1 text-xs font-medium">
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

        <label className="flex flex-col gap-1 text-xs font-medium">
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
          <label className="flex flex-col gap-1 text-xs font-medium">
            Category
            <input
              type="text"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">
            Tags (comma separated)
            <input
              type="text"
              name="tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-xs font-medium">
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
          <button
            type="submit"
            disabled={updatePending}
            className="rounded-md border px-4 py-1.5 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-60 dark:hover:bg-zinc-800"
          >
            {updatePending ? "Saving…" : "Save edits"}
          </button>
          <span className="ml-3 text-xs text-zinc-500">
            Edits are stored without publishing — approving publishes exactly
            what this form shows.
          </span>
          {updateState.success ? (
            <p className="mt-2 text-sm text-green-700">Edits saved.</p>
          ) : null}
          {updateState.error ? (
            <p className="mt-2 text-sm text-red-600">{updateState.error}</p>
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
            <button
              type="submit"
              formAction={approveFormAction}
              disabled={approvePending}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
            >
              {approvePending ? "Approving…" : "Approve"}
            </button>
            {approveState.error ? (
              <p className="text-sm text-red-600">{approveState.error}</p>
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
            <button
              type="submit"
              formAction={rejectFormAction}
              formNoValidate
              disabled={rejectPending}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {rejectPending ? "Rejecting…" : "Reject"}
            </button>
            {rejectState.error ? (
              <p className="text-sm text-red-600">{rejectState.error}</p>
            ) : null}
          </div>
        </div>
      </form>
    </li>
  );
}