"use client";

import { useActionState, useState } from "react";
import { submitPoem, type PoetResult } from "@/app/actions";
import { PoetSelect } from "./poet-select";

export function SubmitPoemForm() {
  const [state, formAction, pending] = useActionState(
    submitPoem,
    {} as { error?: string; success?: boolean },
  );

  // Controlled fields so React's form-action auto-reset doesn't wipe the
  // user's input when the server action returns an error.
  const [selectedPoet, setSelectedPoet] = useState<PoetResult | null>(null);
  const [proposeMode, setProposeMode] = useState(false);
  const [proposedNameAm, setProposedNameAm] = useState("");
  const [proposedNameEn, setProposedNameEn] = useState("");
  const [proposedBio, setProposedBio] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [source, setSource] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  function clearProposal() {
    setProposeMode(false);
    setProposedNameAm("");
    setProposedNameEn("");
    setProposedBio("");
  }

  function handlePoetChange(poet: PoetResult | null) {
    setSelectedPoet(poet);
    if (poet) {
      // XOR: picking an existing poet collapses the proposal fields.
      clearProposal();
      setClientError(null);
    }
  }

  function togglePropose() {
    if (!proposeMode) {
      // XOR: proposing clears any selected poet.
      setSelectedPoet(null);
      setClientError(null);
    }
    setProposeMode((v) => !v);
  }

  // Client-side mirror of the poem_submissions_poet_xor check constraint:
  // exactly one of (selected poet) or (proposed poet name) — never both,
  // never neither. Gives a clear error before anything hits the server.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const hasPoet = Boolean(selectedPoet);
    const hasProposal = proposedNameAm.trim().length > 0;
    if (!hasPoet && !hasProposal) {
      e.preventDefault();
      setClientError(
        "Please select an existing poet, or add new poet details below the search box.",
      );
      return;
    }
    if (hasPoet && hasProposal) {
      e.preventDefault();
      setClientError(
        "Either select an existing poet or propose a new one — not both.",
      );
      return;
    }
    setClientError(null);
  }

  if (state.success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        <p className="mb-2 font-semibold">Your poem was submitted.</p>
        <p>
          It is now <strong>pending moderator review</strong> and will not
          appear publicly until a moderator approves it. You can track its
          status on{" "}
          <a href="/my-submissions" className="underline">
            my submissions
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-5">
      {clientError ?? state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {clientError ?? state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Poet
        <span className="mb-1 text-xs font-normal text-zinc-500">
          Pick an existing poet from the registry — or propose a new one
          inline; a moderator sorts it out during review.
        </span>
        <PoetSelect
          value={selectedPoet}
          onChange={handlePoetChange}
          onRequestNew={() => setProposeMode(true)}
        />
      </label>

      <div className="-mt-3 text-xs">
        <button
          type="button"
          onClick={togglePropose}
          className="text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-100"
        >
          Didn&apos;t find the poet listed?{" "}
          <span className="font-medium">+ Add poet details</span>
        </button>
      </div>

      {proposeMode ? (
        <div className="flex flex-col gap-3 rounded-md border border-dashed p-4">
          <p className="text-xs text-zinc-500">
            Propose a new poet for the registry. The poet is only created if a
            moderator approves this submission.
          </p>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Poet name (Amharic) <span className="text-red-600">*</span>
            <input
              type="text"
              name="proposed_poet_name_am"
              required
              autoComplete="off"
              value={proposedNameAm}
              onChange={(e) => setProposedNameAm(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Poet name (English, optional)
            <input
              type="text"
              name="proposed_poet_name_en"
              autoComplete="off"
              value={proposedNameEn}
              onChange={(e) => setProposedNameEn(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Short bio (optional)
            <textarea
              name="proposed_poet_bio"
              rows={3}
              value={proposedBio}
              onChange={(e) => setProposedBio(e.target.value)}
              className="whitespace-pre-wrap rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </label>
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Title
        <input
          type="text"
          name="title"
          required
          autoComplete="off"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Poem text
        <textarea
          name="body"
          required
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Lines are preserved exactly as written."
          className="whitespace-pre-wrap rounded-md border px-3 py-2 font-normal text-sm leading-relaxed outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Category
          <input
            type="text"
            name="category"
            autoComplete="off"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. ፍቅር, ባህል"
            className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Tags
          <input
            type="text"
            name="tags"
            autoComplete="off"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma separated, e.g. ፍቅር, modern"
            className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Source
        <input
          type="text"
          name="source"
          required
          autoComplete="off"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder={
            proposeMode
              ? "Book, website, personal knowledge… (for the poem and the proposed poet)"
              : "Book, website, personal knowledge, oral tradition…"
          }
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <span className="text-xs font-normal text-zinc-500">
          Where did you get this{proposeMode ? " poem and poet details" : " poem"}?
          This helps our moderators verify attribution before publishing.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}