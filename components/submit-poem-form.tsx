"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitPoem } from "@/app/actions";
import { PoetSelect } from "./poet-select";

export function SubmitPoemForm() {
  const [state, formAction, pending] = useActionState(
    submitPoem,
    {} as { error?: string; success?: boolean },
  );

  if (state.success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        <p className="mb-2 font-semibold">Your poem was submitted.</p>
        <p>
          It is now <strong>pending moderator review</strong> and will not
          appear publicly until a moderator approves it. You can track its
          status on{" "}
          <Link href="/my-submissions" className="underline">
            my submissions
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Poet
        <span className="mb-1 text-xs font-normal text-zinc-500">
          Every poem must be linked to an existing poet. See how it works
          below the form.
        </span>
        <PoetSelect />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Title
        <input
          type="text"
          name="title"
          required
          autoComplete="off"
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Poem text
        <textarea
          name="body"
          required
          rows={12}
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
          placeholder="Book, website, personal knowledge, oral tradition…"
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <span className="text-xs font-normal text-zinc-500">
          Where did you get this poem? This helps our moderators verify
          attribution before publishing.
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