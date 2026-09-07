"use client";

import { useActionState, useState } from "react";
import { changeEmail, type AccountFormState } from "@/app/actions";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, pending] = useActionState(
    changeEmail,
    {} as AccountFormState,
  );
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="form-stack">
      <Card className="border-primary/15 shadow-sm"><CardHeader className="border-b border-border/70 bg-accent/20"><CardTitle className="font-serif text-xl">Change email</CardTitle><p className="text-sm text-muted-foreground">
        Currently {currentEmail}. Supabase will send a confirmation link to
        both this address and the new one.
      </p></CardHeader><CardContent className="space-y-4 pt-5">

      {state.error ? (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      ) : null}
      {state.success ? (
        <Alert className="border-secondary/30 bg-secondary/10 text-secondary"><AlertDescription className="text-secondary/90">{state.success}</AlertDescription></Alert>
      ) : null}

      <label className="space-y-2 text-sm font-medium"><span>New email</span><Input type="email" name="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <Button type="submit" disabled={pending} variant="outline">{pending ? "Sending..." : "Send confirmation"}</Button>
      </CardContent></Card>
    </form>
  );
}