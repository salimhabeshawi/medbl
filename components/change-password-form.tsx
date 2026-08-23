"use client";

import { useActionState, useState } from "react";
import {
  confirmPasswordChange,
  startPasswordChange,
  type AccountFormState,
} from "@/app/actions";

const inputClass =
  "rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400";

export function ChangePasswordForm() {
  const [startState, startAction, startPending] = useActionState(
    startPasswordChange,
    {} as AccountFormState,
  );
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmPasswordChange,
    {} as AccountFormState,
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);
  // Kept across the code step so the retry can include it.
  const [pendingPassword, setPendingPassword] = useState("");

  function handleStart(e: React.FormEvent<HTMLFormElement>) {
    if (password !== confirm) {
      e.preventDefault();
      setMismatch(true);
      return;
    }
    setMismatch(false);
    setPendingPassword(password);
  }

  const needsCode = Boolean(startState.needsCode);
  const error = mismatch
    ? "Passwords do not match."
    : (needsCode ? confirmState.error : startState.error);
  const success = needsCode ? confirmState.success : startState.success;

  if (needsCode) {
    return (
      <form action={confirmAction} className="flex flex-col gap-3 rounded-lg border p-6">
        <p className="text-sm font-medium">Confirm password change</p>
        {success ? (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {success}
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <p className="text-xs text-zinc-500">
          Enter the one-time code we emailed to your registered address, then
          confirm. Your new password stays as you typed it.
        </p>
        <input type="hidden" name="password" value={pendingPassword} />
        <label className="flex flex-col gap-1 text-sm font-medium sm:w-48">
          One-time code
          <input
            type="text"
            name="nonce"
            required
            autoComplete="one-time-code"
            autoFocus
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={confirmPending}
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {confirmPending ? "Confirming…" : "Finish changing password"}
        </button>
      </form>
    );
  }

  return (
    <form
      action={startAction}
      onSubmit={handleStart}
      className="flex flex-col gap-3 rounded-lg border p-6"
    >
      <p className="text-sm font-medium">Change password</p>
      {success && !needsCode ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {success}
        </p>
      ) : null}
      {error && !mismatch ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

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
        disabled={startPending}
        className="self-start rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-60 dark:hover:bg-zinc-800"
      >
        {startPending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}