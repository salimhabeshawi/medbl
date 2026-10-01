"use client";

import { useActionState, useState } from "react";
import {
  approveSubmission,
  rejectSubmission,
  updateSubmission,
} from "@/app/actions";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { CategorySelect, type CategorySelectRecord } from "./category-select";
import { TagInput } from "./tag-input";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  UserRoundPlus,
} from "lucide-react";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import { LoadingSpinner } from "@/components/loading-spinner";

type PoetMatch = {
  id: string;
  name_am: string;
  name_en: string | null;
};

type Props = {
  id: string;
  title: string;
  body: string;
  source: string;
  categoryId: string | null;
  tags: string[] | null;
  poetId: string | null;
  poetName: string | null;
  proposal: { nameAm: string; nameEn: string | null; bio: string | null } | null;
  matches: PoetMatch[];
  createdAt: string;
  categories: CategorySelectRecord[];
};

/**
 * Radix RadioGroup treats "" as "nothing selected", so the "create the poet as
 * proposed" option needs a real value. `matchChoice` itself keeps its original
 * meaning (empty = let approve_poem_submission() create the proposed poet) and
 * the submitted `poet_id` is still derived from it exactly as before, so
 * swapping in the shadcn control leaves the form payload untouched.
 */
const CREATE_NEW_POET = "create-new";

export function SubmissionReview({
  id,
  title: initialTitle,
  body: initialBody,
  source: initialSource,
  categoryId: initialCategoryId,
  tags,
  poetId,
  poetName,
  proposal,
  matches,
  createdAt,
  categories,
}: Props) {
  const tMod = useTranslations("Moderate");
  const tCommon = useTranslations("Common");
  const tPoems = useTranslations("Poems");

  const [updateState, updateFormAction, updatePending] = useActionState(
    updateSubmission,
    {} as { error?: string; success?: boolean },
  );
  const [approveState, approveFormAction, approvePending] = useActionState(
    approveSubmission,
    {} as { error?: string; success?: boolean },
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectSubmission,
    {} as { error?: string; success?: boolean },
  );

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [source, setSource] = useState(initialSource);
  const [proposedNameAm, setProposedNameAm] = useState(
    proposal?.nameAm ?? "",
  );
  const [proposedNameEn, setProposedNameEn] = useState(
    proposal?.nameEn ?? "",
  );
  const [proposedBio, setProposedBio] = useState(proposal?.bio ?? "");
  // "" = proceed as proposed (create the new poet); otherwise a matched
  // existing poet's id to use instead.
  const [matchChoice, setMatchChoice] = useState("");

  if (approveState.success || rejectState.success) {
    return (
      <li>
        <Card className="border-secondary/30 bg-secondary/10 shadow-none">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <CheckCircle2
              className="size-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-secondary">
              {tMod("reviewed")}
            </p>
          </CardContent>
        </Card>
      </li>
    );
  }

  // Radix needs a non-empty value per option, so map "" <-> CREATE_NEW_POET.
  const matchGroupValue = matchChoice === "" ? CREATE_NEW_POET : matchChoice;
  const proposedNameForSummary = proposedNameAm || proposal?.nameAm || "";

  return (
    <li>
      <Card className="gap-0 border-primary/15 py-0 shadow-sm">
        <CardHeader className="gap-2 border-b border-border/70 bg-accent/20 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Clock className="size-3" aria-hidden="true" />
              {new Date(createdAt).toLocaleDateString()}
            </Badge>
            {poetId && poetName ? (
              <Badge variant="secondary" className="gap-1">
                <UserRoundPlus className="size-3" aria-hidden="true" />
                {poetName}
              </Badge>
            ) : null}
          </div>
          {/* The poem's own title is what a moderator scans the queue for, so it
              heads the card instead of a generic "Review submission" label. */}
          <CardTitle className="font-serif text-xl leading-snug sm:text-2xl">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
          {/* ONE shared form: every button below submits the CURRENT field
              values. "Save edits" stores them; "Approve" persists them and then
              publishes via approve_poem_submission; "Reject" ignores them. */}
          <form action={updateFormAction} className="flex flex-col gap-5">
            <input type="hidden" name="submission_id" value={id} />
            {/* Resolved poet for approval: a fuzzy match beats the proposal;
                empty lets approve_poem_submission fall back (own poet_id or
                create the proposed poet). */}
            <input
              type="hidden"
              name="poet_id"
              value={matchChoice || poetId || ""}
            />

            {poetId ? (
              <div className="space-y-2">
                <Label htmlFor={`poet-${id}`}>{tCommon("poet")}</Label>
                <div
                  id={`poet-${id}`}
                  className="flex items-center gap-2 rounded-lg border border-border/70 bg-accent/20 px-3 py-2.5 text-sm"
                >
                  <UserRoundPlus
                    className="size-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground">
                    {poetName ?? tCommon("unknownPoet")}
                  </span>
                </div>
              </div>
            ) : (
              <fieldset className="rounded-lg border border-dashed border-primary/40 bg-accent/20 p-4">
                <legend className="px-1">
                  <Badge
                    variant="outline"
                    className="gap-1 border-primary/30 bg-card text-primary"
                  >
                    <UserRoundPlus className="size-3" aria-hidden="true" />
                    {tMod("newPoetProposed")}
                  </Badge>
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`proposed-name-am-${id}`}>
                      {tMod("nameAmharic")}
                    </Label>
                    <Input
                      id={`proposed-name-am-${id}`}
                      type="text"
                      name="proposed_poet_name_am"
                      required
                      autoComplete="off"
                      value={proposedNameAm}
                      onChange={(e) => setProposedNameAm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`proposed-name-en-${id}`}>
                      {tMod("nameEnglish")}
                    </Label>
                    <Input
                      id={`proposed-name-en-${id}`}
                      type="text"
                      name="proposed_poet_name_en"
                      autoComplete="off"
                      value={proposedNameEn}
                      onChange={(e) => setProposedNameEn(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor={`proposed-bio-${id}`}>{tMod("bio")}</Label>
                  <Textarea
                    id={`proposed-bio-${id}`}
                    name="proposed_poet_bio"
                    rows={2}
                    value={proposedBio}
                    onChange={(e) => setProposedBio(e.target.value)}
                    className="whitespace-pre-wrap"
                  />
                </div>

                <div className="mt-4 rounded-lg border border-border/70 bg-card/70 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Search
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {tMod("similarPoetsBaseLabel")}
                    {matches.length === 0 ? ` — ${tMod("noneFound")}` : null}
                  </p>
                  {matches.length > 0 ? (
                    <RadioGroup
                      className="mt-3 gap-2"
                      name="match_choice"
                      value={matchGroupValue}
                      onValueChange={(next) =>
                        setMatchChoice(next === CREATE_NEW_POET ? "" : next)
                      }
                    >
                      <label
                        htmlFor={`match-choice-new-${id}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-accent/40",
                          matchGroupValue === CREATE_NEW_POET
                            ? "border-primary/50 bg-accent/40"
                            : "border-border/70",
                        )}
                      >
                        <RadioGroupItem
                          id={`match-choice-new-${id}`}
                          value={CREATE_NEW_POET}
                          className="mt-0.5"
                        />
                        <span className="min-w-0">
                          {tMod("createNewPoetAsProposed", {
                            name: proposedNameForSummary,
                          })}
                        </span>
                      </label>
                      {matches.map((m) => (
                        <label
                          key={m.id}
                          htmlFor={`match-choice-${m.id}`}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-accent/40",
                            matchGroupValue === m.id
                              ? "border-primary/50 bg-accent/40"
                              : "border-border/70",
                          )}
                        >
                          <RadioGroupItem
                            id={`match-choice-${m.id}`}
                            value={m.id}
                            className="mt-0.5"
                          />
                          <span className="min-w-0">
                            {tMod("useExistingLabel")}{" "}
                            <strong className="font-semibold text-foreground">
                              {m.name_am}
                            </strong>
                            {m.name_en ? (
                              <span className="text-muted-foreground">
                                {" "}
                                ({m.name_en})
                              </span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  ) : null}
                </div>
              </fieldset>
            )}

            <div className="space-y-2">
              <Label htmlFor={`title-${id}`}>{tMod("titleLabel")}</Label>
              <Input
                id={`title-${id}`}
                type="text"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`body-${id}`}>{tMod("poemText")}</Label>
              <Textarea
                id={`body-${id}`}
                name="body"
                rows={10}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="leading-relaxed whitespace-pre-wrap"
              />
            </div>

            {/* Same minmax(0,1fr) treatment as the action row below: the
                category SelectTrigger is whitespace-nowrap, so an implicit
                `auto` track would be floored by its min-content on a phone. */}
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label className="min-w-0">{tPoems("category")}</Label>
                <CategorySelect
                  categories={categories}
                  defaultValue={initialCategoryId ?? ""}
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label className="min-w-0">{tMod("tagsSpaceSep")}</Label>
                <TagInput name="tags" initialTags={tags ?? []} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`source-${id}`}>{tPoems("source")}</Label>
              <Input
                id={`source-${id}`}
                type="text"
                name="source"
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              {/* Stacks on phones; the hint only sits beside the button from sm up. */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Button
                  type="submit"
                  disabled={updatePending}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {updatePending ? <LoadingSpinner /> : null}
                  {updatePending ? tCommon("saving") : tCommon("saveEdits")}
                </Button>
                <p className="text-xs leading-5 text-muted-foreground">
                  {tMod("saveEditsHint")}
                </p>
              </div>
              {updateState.success ? (
                <Alert className="border-secondary/30 bg-secondary/10 text-secondary">
                  <CheckCircle2 aria-hidden="true" />
                  <AlertDescription className="text-secondary/90">
                    {tCommon("editsSaved")}
                  </AlertDescription>
                </Alert>
              ) : null}
              {updateState.error ? (
                <Alert variant="destructive">
                  <AlertTriangle aria-hidden="true" />
                  <AlertDescription>{updateState.error}</AlertDescription>
                </Alert>
              ) : null}
            </div>

            <Separator />

            {/* An implicit `auto` column track would be floored by the
                attribution select's min-content (its option labels are long
                sentences and the trigger is whitespace-nowrap), pushing BOTH
                halves of this row past the card edge on a phone. minmax(0,1fr)
                lets the single mobile track shrink to the container, and the
                min-w-0 chain lets each control actually give way below it. */}
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-3">
                <div className="min-w-0 space-y-2">
                  <Label className="min-w-0">{tMod("attribution")}</Label>
                  <Select name="attribution_status" defaultValue="community">
                    <SelectTrigger
                      className="h-10 w-full min-w-0"
                      aria-label={tMod("attribution")}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">
                        {tMod("attributionCommunity")}
                      </SelectItem>
                      <SelectItem value="verified">
                        {tMod("attributionVerified")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  formAction={approveFormAction}
                  disabled={approvePending}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  {approvePending ? <LoadingSpinner /> : null}
                  {approvePending ? tMod("approvingEllipsis") : tMod("approve")}
                </Button>
                {approveState.error ? (
                  <Alert variant="destructive">
                    <AlertTriangle aria-hidden="true" />
                    <AlertDescription>{approveState.error}</AlertDescription>
                  </Alert>
                ) : null}
              </div>

              <div className="min-w-0 space-y-3">
                <div className="min-w-0 space-y-2">
                  <Label
                    htmlFor={`rejection-reason-${id}`}
                    className="min-w-0"
                  >
                    {tMod("rejectionReasonLabel")}
                  </Label>
                  <Input
                    id={`rejection-reason-${id}`}
                    type="text"
                    name="rejection_reason"
                    placeholder={tMod("rejectionReasonPlaceholder")}
                  />
                </div>
                <Button
                  type="submit"
                  formAction={rejectFormAction}
                  formNoValidate
                  disabled={rejectPending}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                >
                  {rejectPending ? <LoadingSpinner /> : null}
                  {rejectPending ? tMod("rejectingEllipsis") : tMod("reject")}
                </Button>
                {rejectState.error ? (
                  <Alert variant="destructive">
                    <AlertTriangle aria-hidden="true" />
                    <AlertDescription>{rejectState.error}</AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </li>
  );
}
