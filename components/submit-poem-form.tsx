"use client";

import { useActionState, useState } from "react";
import { submitPoem, type PoetResult } from "@/app/actions";
import { PoetSelect } from "./poet-select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export function SubmitPoemForm() {
  const [state, formAction, pending] = useActionState(
    submitPoem,
    {} as { error?: string; success?: boolean },
  );

  // Controlled fields so React's form-action auto-reset doesn't wipe the
  // user's input when the server action returns an error.
  const [selectedPoet, setSelectedPoet] = useState<PoetResult | null>(null);
  const [proposeMode, setProposeMode] = useState(false);
  const [proposedNameAm, setProposedNameAm] = useState("");
  const [proposedNameEn, setProposedNameEn] = useState("");
  const [proposedBio, setProposedBio] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
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
      // XOR: picking an existing poet collapses the proposal fields.
      clearProposal();
      setClientError(null);
    }
  }

  function togglePropose() {
    if (!proposeMode) {
      // XOR: proposing clears any selected poet.
      setSelectedPoet(null);
      setClientError(null);
    }
    setProposeMode((v) => !v);
  }

  // Client-side mirror of the poem_submissions_poet_xor check constraint:
  // exactly one of (selected poet) or (proposed poet name) — never both,
  // never neither. Gives a clear error before anything hits the server.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const hasPoet = Boolean(selectedPoet);
    const hasProposal = proposedNameAm.trim().length > 0;
    if (!hasPoet && !hasProposal) {
      e.preventDefault();
      setClientError(
        "Please select an existing poet, or add new poet details below the search box.",
      );
      return;
    }
    if (hasPoet && hasProposal) {
      e.preventDefault();
      setClientError(
        "Either select an existing poet or propose a new one — not both.",
      );
      return;
    }
    setClientError(null);
  }

  if (state.success) {
    return (
      <Alert className="border-secondary/30 bg-secondary/10 text-secondary">
        <AlertTitle>Your poem is in the review queue</AlertTitle>
        <AlertDescription className="text-secondary/90">
          It is now <strong>pending moderator review</strong> and will not
          appear publicly until a moderator approves it. You can track its
          status on{" "}
          <a href="/my-submissions" className="underline">
            my submissions
          </a>
          .
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      {clientError ?? state.error ? (
        <Alert variant="destructive">
          <AlertTitle>We could not submit this poem</AlertTitle>
          <AlertDescription>{clientError ?? state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <CardTitle className="font-serif text-xl">Who wrote it?</CardTitle>
          <p className="text-sm text-muted-foreground">Choose a poet from the registry, or propose one for moderator review.</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <label className="space-y-2 text-sm font-medium"><span>Poet</span><PoetSelect value={selectedPoet} onChange={handlePoetChange} onRequestNew={() => setProposeMode(true)} /></label>
          <button type="button" onClick={togglePropose} className="text-sm font-medium text-primary underline-offset-4 hover:underline">Didn&apos;t find the poet? <span>+ Add poet details</span></button>
          {proposeMode ? (
            <div className="space-y-4 rounded-lg border border-dashed border-primary/40 bg-accent/20 p-4">
              <p className="text-sm text-muted-foreground">The poet is only added if a moderator approves this submission.</p>
              <label className="space-y-2 text-sm font-medium"><span>Poet name (Amharic) <span className="text-destructive">*</span></span><Input type="text" name="proposed_poet_name_am" required autoComplete="off" value={proposedNameAm} onChange={(e) => setProposedNameAm(e.target.value)} /></label>
              <label className="space-y-2 text-sm font-medium"><span>Poet name (English, optional)</span><Input type="text" name="proposed_poet_name_en" autoComplete="off" value={proposedNameEn} onChange={(e) => setProposedNameEn(e.target.value)} /></label>
              <label className="space-y-2 text-sm font-medium"><span>Short bio (optional)</span><Textarea name="proposed_poet_bio" rows={3} value={proposedBio} onChange={(e) => setProposedBio(e.target.value)} /></label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20"><CardTitle className="font-serif text-xl">The poem</CardTitle><p className="text-sm text-muted-foreground">Keep the original line breaks and include the source.</p></CardHeader>
        <CardContent className="space-y-5 pt-5">
          <label className="space-y-2 text-sm font-medium"><span>Title</span><Input type="text" name="title" required autoComplete="off" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="space-y-2 text-sm font-medium"><span>Poem text</span><Textarea name="body" required rows={12} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Lines are preserved exactly as written." className="min-h-64 whitespace-pre-wrap leading-relaxed" /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span>Category</span><Input type="text" name="category" autoComplete="off" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. love, culture" /></label><label className="space-y-2 text-sm font-medium"><span>Tags</span><Input type="text" name="tags" autoComplete="off" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Space separated, e.g. love modern" /></label></div>
          <label className="space-y-2 text-sm font-medium"><span>Source</span><Input type="text" name="source" required autoComplete="off" value={source} onChange={(e) => setSource(e.target.value)} placeholder={proposeMode ? "Book, website, personal knowledge..." : "Book, website, personal knowledge, oral tradition..."} /><span className="block text-xs font-normal text-muted-foreground">This helps moderators verify attribution before publishing.</span></label>
          <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">{pending ? "Submitting..." : "Submit for review"}</Button>
        </CardContent>
      </Card>
    </form>
  );
}