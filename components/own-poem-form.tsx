"use client";

import { useActionState, useState } from "react";
import { submitPoem } from "@/app/actions";

const inputClass =
  "rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400";

// Poem-only submission for users whose profiles.poet_id is already set.
// No poet search, no proposal fields — attribution is fixed server-side.
export function OwnPoemForm({ poetId }: { poetId: string }) {
  const [state, formAction, pending] = useActionState(
    submitPoem,
    {} as { error?: string; success?: boolean },
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [source, setSource] = useState("");

  if (state.success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        <p className="mb-2 font-semibold">Your poem was submitted.</p>
        <p>
          It is now <strong>pending moderator review</strong> and will not
          appear publicly until a moderator approves it.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="poet_id" value={poetId} />

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
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
          className={inputClass}
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
          className={`whitespace-pre-wrap font-normal text-sm leading-relaxed ${inputClass}`}
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
            className={inputClass}
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
            className={inputClass}
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
          placeholder="Book, website, personal knowledge…"
          className={inputClass}
        />
        <span className="text-xs font-normal text-zinc-500">
          Where did you get this poem? This helps moderators verify it&apos;s
          really yours before publishing.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}