"use client";

import { useActionState, useState } from "react";
import { savePoetProfile } from "@/app/actions";

const inputClass =
  "rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400";

export function PoetDetailsForm({
  initial,
  linked,
  redirectTo,
  cameFrom,
}: {
  initial: { nameAm: string; nameEn: string; birthYear: string; bio: string };
  linked: boolean;
  redirectTo: string | null;
  cameFrom: string;
}) {
  const [state, formAction, pending] = useActionState(
    savePoetProfile,
    {} as { error?: string; success?: boolean },
  );

  const [nameAm, setNameAm] = useState(initial.nameAm);
  const [nameEn, setNameEn] = useState(initial.nameEn);
  const [birthYear, setBirthYear] = useState(initial.birthYear);
  const [bio, setBio] = useState(initial.bio);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-6">
      {/* Where to go after a successful save. The server action redirects:
          explicit ?redirect= target first, then came_from, then "/". */}
      <input type="hidden" name="redirect_to" value={redirectTo ?? ""} />
      <input type="hidden" name="came_from" value={cameFrom} />

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Poet name (Amharic) <span className="text-red-600">*</span>
          <input
            type="text"
            name="name_am"
            required
            autoComplete="off"
            value={nameAm}
            onChange={(e) => setNameAm(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Poet name (English, optional)
          <input
            type="text"
            name="name_en"
            autoComplete="off"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium sm:w-48">
        Birth year (optional)
        <input
          type="number"
          name="birth_year"
          inputMode="numeric"
          min={1000}
          max={new Date().getFullYear()}
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Short bio (optional)
        <textarea
          name="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={`whitespace-pre-wrap ${inputClass}`}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : linked ? "Save changes" : "Save poet profile"}
      </button>
    </form>
  );
}