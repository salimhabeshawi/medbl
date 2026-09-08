"use client";

import { useActionState, useState } from "react";
import { changePassword, type AccountFormState } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useTranslations } from "next-intl";

export function ChangePasswordForm() {
  const tProf = useTranslations("Profile");
  const tCommon = useTranslations("Common");

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

  const tProfInline = useTranslations("Profile");
  const error = mismatch ? tProfInline("passwordMismatch") : state.error;

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="form-stack"
    >
      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <CardTitle className="font-serif text-xl">{tProf("changePasswordTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {state.success ? (
            <Alert className="border-secondary/30 bg-secondary/10 text-secondary">
              <AlertDescription className="text-secondary/90">{state.success}</AlertDescription>
            </Alert>
          ) : null}
          {error && !mismatch ? (
            <Alert variant="destructive">
              <AlertTitle>{tCommon("error")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <label className="space-y-2 text-sm font-medium">
            <span>{tProf("currentPasswordLabel")}</span>
            <Input type="password" name="current_password" required autoComplete="current-password" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>{tProf("newPasswordLabel")}</span>
              <Input type="password" name="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>{tProf("newPasswordLabel")}</span>
              <Input type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
          </div>
          <Button type="submit" disabled={pending} variant="outline">
            {pending ? tCommon("loading") : tProf("changePasswordBtn")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}