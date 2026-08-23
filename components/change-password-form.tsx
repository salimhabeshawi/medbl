"use client";

import { useActionState, useState } from "react";
import { changePassword, type AccountFormState } from "@/app/actions";

const inputClass =
  "rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    {} as AccountFormState,
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (password !== confirm) {
      e.preventDefault();
      setMismatch(true);
      return;
    }
    setMismatch(false);
  }

  const error = mismatch ? "Passwords do not match." : state.error;

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border p-6"
    >
      <p className="text-sm font-medium">Change password</p>
      {state.success ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.success}
        </p>
      ) : null}
      {error && !mismatch ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Current password
        <input
          type="password"
          name="current_password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          New password
          <input
            type="password"
            name="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Confirm new password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-60 dark:hover:bg-zinc-800"
      >
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}