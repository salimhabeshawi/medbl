"use client";

import { useActionState, useState } from "react";
import { savePoetProfile } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

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
    <form action={formAction} className="form-stack">
      {/* Where to go after a successful save. The server action redirects:
          explicit ?redirect= target first, then came_from, then "/". */}
      <input type="hidden" name="redirect_to" value={redirectTo ?? ""} />
      <input type="hidden" name="came_from" value={cameFrom} />

      {state.error ? (
        <Alert variant="destructive" className="mb-5"><AlertTitle>We could not save your profile</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>
      ) : null}
      <Card className="border-primary/15 shadow-sm"><CardHeader className="border-b border-border/70 bg-accent/20"><CardTitle className="font-serif text-xl">Your poet identity</CardTitle><p className="text-sm text-muted-foreground">This profile is used when you submit poems as the author.</p></CardHeader><CardContent className="space-y-5 pt-5">
        <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span>Poet name (Amharic) <span className="text-destructive">*</span></span><Input type="text" name="name_am" required autoComplete="off" value={nameAm} onChange={(e) => setNameAm(e.target.value)} /></label><label className="space-y-2 text-sm font-medium"><span>Poet name (English, optional)</span><Input type="text" name="name_en" autoComplete="off" value={nameEn} onChange={(e) => setNameEn(e.target.value)} /></label></div>
        <label className="block max-w-48 space-y-2 text-sm font-medium"><span>Birth year (optional)</span><Input type="number" name="birth_year" inputMode="numeric" min={1000} max={new Date().getFullYear()} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} /></label>
        <label className="space-y-2 text-sm font-medium"><span>Short bio (optional)</span><Textarea name="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="whitespace-pre-wrap" /></label>
        <Button type="submit" disabled={pending} size="lg">{pending ? "Saving..." : linked ? "Save changes" : "Save poet profile"}</Button>
      </CardContent></Card>
    </form>
  );
}