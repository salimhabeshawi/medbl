"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitPoetRequest } from "@/app/actions";

export function PoetRequestForm() {
  const [state, formAction, pending] = useActionState(
    submitPoetRequest,
    {} as { error?: string; success?: boolean },
  );

  // Controlled fields so React's form-action auto-reset doesn't wipe the
  // user's input when the server action returns an error.
  const [nameAm, setNameAm] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [bio, setBio] = useState("");
  const [source, setSource] = useState("");

  if (state.success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        <p className="mb-2 font-semibold">Your request was submitted.</p>
        <p>
          It is now <strong>pending moderator review</strong>. Once a
          moderator approves it, the poet is added to our registry and you can
          submit their poems. Track it on{" "}
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
        Amharic name
        <input
          type="text"
          name="name_am"
          required
          autoComplete="off"
          value={nameAm}
          onChange={(e) => setNameAm(e.target.value)}
          placeholder="e.g. ቀኔ ገዳ"
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Transliterated name
        <input
          type="text"
          name="name_en"
          autoComplete="off"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="e.g. Kene Gedah (optional)"
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Bio
        <textarea
          name="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A few words about the poet (optional)"
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Where did you learn about this poet?
        <input
          type="text"
          name="source"
          autoComplete="off"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Book, website, personal knowledge… (optional, but encouraged)"
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Request poet"}
      </button>
    </form>
  );
}