"use client";

import { useActionState, useState } from "react";
import { submitPoem, type PoetResult } from "@/app/actions";
import { PoetSelect } from "./poet-select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { CategorySelect, type CategorySelectRecord } from "./category-select";
import { TagInput } from "./tag-input";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function SubmitPoemForm({ categories }: { categories: CategorySelectRecord[] }) {
  const tSubmit = useTranslations("Submit");
  const tCommon = useTranslations("Common");

  const [state, formAction, pending] = useActionState(
    submitPoem,
    {} as { error?: string; success?: boolean },
  );

  const [selectedPoet, setSelectedPoet] = useState<PoetResult | null>(null);
  const [proposeMode, setProposeMode] = useState(false);
  const [proposedNameAm, setProposedNameAm] = useState("");
  const [proposedNameEn, setProposedNameEn] = useState("");
  const [proposedBio, setProposedBio] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [source, setSource] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  function clearProposal() {
    setProposeMode(false);
    setProposedNameAm("");
    setProposedNameEn("");
    setProposedBio("");
  }

  function handlePoetChange(poet: PoetResult | null) {
    setSelectedPoet(poet);
    if (poet) {
      clearProposal();
      setClientError(null);
    }
  }

  function togglePropose() {
    if (!proposeMode) {
      setSelectedPoet(null);
      setClientError(null);
    }
    setProposeMode((v) => !v);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const hasPoet = Boolean(selectedPoet);
    const hasProposal = proposedNameAm.trim().length > 0;
    if (!hasPoet && !hasProposal) {
      e.preventDefault();
      setClientError(tSubmit("poetSelectionRequired"));
      return;
    }
    if (hasPoet && hasProposal) {
      e.preventDefault();
      setClientError(tSubmit("poetSelectionConflict"));
      return;
    }
    setClientError(null);
  }

  if (state.success) {
    return (
      <Alert className="border-secondary/30 bg-secondary/10 text-secondary">
        <AlertTitle>{tSubmit("successTitle")}</AlertTitle>
        <AlertDescription className="text-secondary/90">
          {tSubmit("successDesc")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      {clientError ?? state.error ? (
        <Alert variant="destructive">
          <AlertTitle>{tCommon("error")}</AlertTitle>
          <AlertDescription>{clientError ?? state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="relative z-30 overflow-visible border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <CardTitle className="font-serif text-xl">{tSubmit("poetSelection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("poetSelection")}</span>
            <PoetSelect value={selectedPoet} onChange={handlePoetChange} onRequestNew={() => setProposeMode(true)} />
          </label>
          <button type="button" onClick={togglePropose} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {tSubmit("proposePoetToggle")}
          </button>
          {proposeMode ? (
            <div className="space-y-4 rounded-lg border border-dashed border-primary/40 bg-accent/20 p-4">
              <label className="space-y-2 text-sm font-medium">
                <span>{tSubmit("proposedNameAm")} <span className="text-destructive">*</span></span>
                <Input type="text" name="proposed_poet_name_am" required autoComplete="off" value={proposedNameAm} onChange={(e) => setProposedNameAm(e.target.value)} placeholder={tSubmit("proposedNameAmPlaceholder")} />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>{tSubmit("proposedNameEn")}</span>
                <Input type="text" name="proposed_poet_name_en" autoComplete="off" value={proposedNameEn} onChange={(e) => setProposedNameEn(e.target.value)} placeholder={tSubmit("proposedNameEnPlaceholder")} />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>{tSubmit("proposedBio")}</span>
                <Textarea name="proposed_poet_bio" rows={3} value={proposedBio} onChange={(e) => setProposedBio(e.target.value)} placeholder={tSubmit("proposedBioPlaceholder")} />
              </label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="relative z-0 border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <CardTitle className="font-serif text-xl">{tSubmit("poemDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("poemTitle")}</span>
            <Input type="text" name="title" required autoComplete="off" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tSubmit("poemTitlePlaceholder")} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("poemBody")}</span>
            <Textarea name="body" required rows={12} value={body} onChange={(e) => setBody(e.target.value)} placeholder={tSubmit("poemBodyPlaceholder")} className="min-h-64 whitespace-pre-wrap leading-relaxed" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>{tSubmit("category")}</span>
              <CategorySelect categories={categories} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>{tSubmit("tags")}</span>
              <TagInput />
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("source")}</span>
            <Input type="text" name="source" required autoComplete="off" value={source} onChange={(e) => setSource(e.target.value)} placeholder={tSubmit("sourcePlaceholder")} />
          </label>
          <p className="text-sm text-muted-foreground">
            {tSubmit("termsNoticePrefix")} {" "}
            <Link href="/terms" className="text-primary underline">{tSubmit("termsLink")}</Link>.
          </p>
          <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
            {pending ? tSubmit("submitting") : tSubmit("submitBtn")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}