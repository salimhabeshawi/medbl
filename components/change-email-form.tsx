"use client";

import { useActionState, useState } from "react";
import { changeEmail, type AccountFormState } from "@/app/actions";

const inputClass =
  "rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, pending] = useActionState(
    changeEmail,
    {} as AccountFormState,
  );
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-6">
      <p className="text-sm font-medium">Change email</p>
      <p className="text-xs text-zinc-500">
        Currently {currentEmail}. Supabase will send a confirmation link to
        both this address and the new one.
      </p>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.success}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        New email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-60 dark:hover:bg-zinc-800"
      >
        {pending ? "Sending…" : "Send confirmation"}
      </button>
    </form>
  );
}