"use client";

import { useActionState, useState } from "react";
import { savePoetProfile } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useTranslations } from "next-intl";
import { formatEcAsGcRange } from "@/lib/calendar";

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
  const tProf = useTranslations("Profile");
  const tCommon = useTranslations("Common");

  const [state, formAction, pending] = useActionState(
    savePoetProfile,
    {} as { error?: string; success?: boolean },
  );

  const [nameAm, setNameAm] = useState(initial.nameAm);
  const [nameEn, setNameEn] = useState(initial.nameEn);
  const [birthYear, setBirthYear] = useState(initial.birthYear);
  const [bio, setBio] = useState(initial.bio);

  const parsedEcYear = Number.parseInt(birthYear.trim(), 10);
  const gcPreview =
    !Number.isNaN(parsedEcYear) && parsedEcYear > 0
      ? formatEcAsGcRange(parsedEcYear)
      : null;

  return (
    <form action={formAction} className="form-stack">
      <input type="hidden" name="redirect_to" value={redirectTo ?? ""} />
      <input type="hidden" name="came_from" value={cameFrom} />

      {state.error ? (
        <Alert variant="destructive" className="mb-5">
          <AlertTitle>{tCommon("error")}</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <CardTitle className="font-serif text-xl">
            {tProf("poetTab")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>{tProf("nameAmLabel")}</span>
              <Input
                type="text"
                name="name_am"
                required
                autoComplete="off"
                value={nameAm}
                onChange={(e) => setNameAm(e.target.value)}
                placeholder={tProf("nameAmPlaceholder")}
                className="mt-2"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>{tProf("nameEnLabel")}</span>
              <Input
                type="text"
                name="name_en"
                autoComplete="off"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder={tProf("nameEnPlaceholder")}
                className="mt-2"
              />
            </label>
          </div>
          <div className="block max-w-48 space-y-2 text-sm font-medium">
            <label className="block space-y-2">
              <span>{tProf("birthYearLabel")}</span>
              <Input
                type="number"
                name="birth_year"
                inputMode="numeric"
                min={1}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="mt-2"
              />
            </label>
            {gcPreview ? (
              <p className="text-xs text-muted-foreground">{gcPreview}</p>
            ) : null}
          </div>
          <label className="space-y-2 text-sm font-medium">
            <span>{tProf("bioLabel")}</span>
            <Textarea
              name="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={tProf("bioPlaceholder")}
              className="whitespace-pre-wrap mt-2"
            />
          </label>
          <Button type="submit" disabled={pending} size="lg" className="mt-4">
            {pending ? tProf("saving") : tProf("savePoetBtn")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
