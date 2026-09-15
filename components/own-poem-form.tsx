"use client";

import { useActionState, useState } from "react";
import { submitPoem } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { CategorySelect, type CategorySelectRecord } from "./category-select";
import { TagInput } from "./tag-input";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function OwnPoemForm({
  poetId,
  categories,
}: {
  poetId: string;
  categories: CategorySelectRecord[];
}) {
  const tSubmit = useTranslations("Submit");
  const tCommon = useTranslations("Common");

  const [state, formAction, pending] = useActionState(
    submitPoem,
    {} as { error?: string; success?: boolean },
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [source, setSource] = useState("");

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
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="poet_id" value={poetId} />
      <input type="hidden" name="submission_mode" value="own" />

      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle>{tCommon("error")}</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/70 bg-accent/20">
          <CardTitle className="font-serif text-xl">
            {tSubmit("poemDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("poemTitle")}</span>
            <Input
              type="text"
              name="title"
              required
              autoComplete="off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tSubmit("poemTitlePlaceholder")}
              className="mt-2 mb-4"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("poemBody")}</span>
            <Textarea
              name="body"
              required
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={tSubmit("poemBodyPlaceholder")}
              className="min-h-64 whitespace-pre-wrap leading-relaxed mt-2"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium mt-4">
              <span>{tSubmit("category")}</span>
              <div className="mt-2">
                <CategorySelect categories={categories} />
              </div>
            </label>
            <label className="space-y-2 text-sm font-medium mt-4">
              <span>{tSubmit("tags")}</span>
              <div className="mt-2">
                <TagInput />
              </div>
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium">
            <span>{tSubmit("source")}</span>
            <Input
              type="text"
              name="source"
              autoComplete="off"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={tSubmit("sourcePlaceholder")}
              className="mt-2"
            />
          </label>
          <p className="text-sm text-muted-foreground mt-10">
            {tSubmit("termsNoticePrefix")}{" "}
            <Link href="/terms" className="text-primary underline">
              {tSubmit("termsLink")}
            </Link>
            .
          </p>
          <Button
            type="submit"
            disabled={pending}
            size="lg"
            className="w-full sm:w-auto"
          >
            {pending ? tSubmit("submitting") : tSubmit("submitBtn")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
