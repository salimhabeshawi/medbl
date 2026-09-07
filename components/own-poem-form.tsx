"use client";

import { useActionState, useState } from "react";
import { submitPoem } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { CategorySelect } from "./category-select";
import { TagInput } from "./tag-input";

// Poem-only submission for users whose profiles.poet_id is already set.
// No poet search, no proposal fields — attribution is fixed server-side.
export function OwnPoemForm({ poetId, categories }: { poetId: string; categories: string[] }) {
  const [state, formAction, pending] = useActionState(
    submitPoem,
    {} as { error?: string; success?: boolean },
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [source, setSource] = useState("");

  if (state.success) {
    return (
      <Alert className="border-secondary/30 bg-secondary/10 text-secondary"><AlertTitle>Your poem is in the review queue</AlertTitle><AlertDescription className="text-secondary/90">
          It is now <strong>pending moderator review</strong> and will not
          appear publicly until a moderator approves it.
      </AlertDescription></Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="poet_id" value={poetId} />
      <input type="hidden" name="submission_mode" value="own" />

      {state.error ? (
        <Alert variant="destructive"><AlertTitle>We could not submit this poem</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>
      ) : null}
      <Card className="border-primary/15 shadow-sm"><CardHeader className="border-b border-border/70 bg-accent/20"><CardTitle className="font-serif text-xl">Your poem</CardTitle><p className="text-sm text-muted-foreground">Share the original text and where it came from.</p></CardHeader><CardContent className="space-y-5 pt-5">
        <label className="space-y-2 text-sm font-medium"><span>Title</span><Input type="text" name="title" required autoComplete="off" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="space-y-2 text-sm font-medium"><span>Poem text</span><Textarea name="body" required rows={12} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Lines are preserved exactly as written." className="min-h-64 whitespace-pre-wrap leading-relaxed" /></label>
        <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span>Category</span><CategorySelect categories={categories} /></label><label className="space-y-2 text-sm font-medium"><span>Tags</span><TagInput /></label></div>
        <label className="space-y-2 text-sm font-medium"><span>Source <span className="text-muted-foreground">(optional)</span></span><Input type="text" name="source" autoComplete="off" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Optional context about the poem" /><span className="block text-xs font-normal text-muted-foreground">Personal knowledge is accepted for your own poem.</span></label>
        <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">{pending ? "Submitting..." : "Submit for review"}</Button>
      </CardContent></Card>
    </form>
  );
}