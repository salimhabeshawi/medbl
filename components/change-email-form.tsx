"use client";

import { useActionState, useState } from "react";
import { changeEmail, type AccountFormState } from "@/app/actions";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useTranslations } from "next-intl";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const tProf = useTranslations("Profile");
  const tCommon = useTranslations("Common");

  const [state, formAction, pending] = useActionState(
    changeEmail,
    {} as AccountFormState,
  );
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="form-stack">
      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <CardTitle className="font-serif text-xl">
            {tProf("changeEmailTitle")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {tProf("currentEmail", { email: currentEmail })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          {state.success ? (
            <Alert className="border-secondary/30 bg-secondary/10 text-secondary">
              <AlertDescription className="text-secondary/90">
                {state.success}
              </AlertDescription>
            </Alert>
          ) : null}

          <label className="space-y-2 text-sm font-medium">
            <span>{tProf("newEmailLabel")}</span>
            <Input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
          </label>
          <Button
            type="submit"
            disabled={pending}
            variant="outline"
            className="mt-4"
          >
            {pending ? tCommon("loading") : tProf("changeEmailBtn")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
