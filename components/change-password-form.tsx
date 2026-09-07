"use client";

import { useActionState, useState } from "react";
import { changePassword, type AccountFormState } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

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
      className="form-stack"
    >
      <Card className="border-primary/15 shadow-sm"><CardHeader className="border-b border-border/70 bg-accent/20"><CardTitle className="font-serif text-xl">Change password</CardTitle><p className="text-sm text-muted-foreground">Use your current password to secure a new one.</p></CardHeader><CardContent className="space-y-4 pt-5">
      {state.success ? (
        <Alert className="border-secondary/30 bg-secondary/10 text-secondary"><AlertDescription className="text-secondary/90">{state.success}</AlertDescription></Alert>
      ) : null}
      {error && !mismatch ? (
        <Alert variant="destructive"><AlertTitle>We could not update your password</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
      ) : null}

      <label className="space-y-2 text-sm font-medium"><span>Current password</span><Input type="password" name="current_password" required autoComplete="current-password" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium"><span>New password</span><Input type="password" name="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="space-y-2 text-sm font-medium"><span>Confirm new password</span><Input type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
      </div>
      <Button type="submit" disabled={pending} variant="outline">{pending ? "Updating..." : "Change password"}</Button>
      </CardContent></Card>
    </form>
  );
}