"use client";

import { useActionState } from "react";
import {
  markReportDisputed,
  removeDisputedPoem,
  republishDisputedPoem,
} from "@/app/actions";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

type Props = {
  id: string;
  poemTitle: string;
  poemId: string;
  poemStatus: string;
  formerStatus: string | null;
  reason: string;
  createdAt: string;
};

export function ReportReview({
  id,
  poemTitle,
  poemId,
  poemStatus,
  formerStatus,
  reason,
  createdAt,
}: Props) {
  const tMod = useTranslations("Moderate");

  const [markState, markAction, markPending] = useActionState(
    markReportDisputed,
    {} as { error?: string; success?: boolean },
  );
  const [republishState, republishAction, republishPending] = useActionState(
    republishDisputedPoem,
    {} as { error?: string; success?: boolean },
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeDisputedPoem,
    {} as { error?: string; success?: boolean },
  );

  const disputed = poemStatus === "disputed";

  return (
    <li className="rounded-xl border border-primary/15 bg-card p-6 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="font-semibold">
          {tMod("poemLabel")}: <span className="font-normal">{poemTitle}</span>
          {disputed ? (
            <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 align-middle text-[11px] font-medium text-red-700">
              {tMod("disputedLabel")}
            </span>
          ) : null}
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="rounded-lg bg-accent/30 p-4 text-sm leading-6 text-muted-foreground">{reason}</p>

      <p className="mt-2 text-xs text-muted-foreground">
        <a
          href={`/poems/${poemId}`}
          target="_blank"
          className="text-muted-foreground underline hover:text-foreground"
        >
          {tMod("viewPoem")}
        </a>
      </p>

      {disputed ? (
        <div className="mt-4">
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>
              {tMod("disputedPoemAlert")}
            </AlertDescription>
          </Alert>
          <div className="grid gap-4 sm:grid-cols-2">
            <form action={republishAction}>
              <input type="hidden" name="report_id" value={id} />
              <Button
                type="submit"
                disabled={republishPending}
                variant="secondary"
              >
                {republishPending
                  ? tMod("republishingEllipsis")
                  : formerStatus
                    ? tMod("republishAs", { status: formerStatus })
                    : tMod("republish")}
              </Button>
              {republishState.error ? (
                <Alert className="mt-2" variant="destructive">
                  <AlertDescription>{republishState.error}</AlertDescription>
                </Alert>
              ) : null}
            </form>
            <form
              action={removeAction}
              onSubmit={(e) => {
                if (!window.confirm(tMod("deleteConfirm"))) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="report_id" value={id} />
              <Button
                type="submit"
                disabled={removePending}
                variant="destructive"
              >
                {removePending ? tMod("removingEllipsis") : tMod("removePoem")}
              </Button>
              {removeState.error ? (
                <Alert className="mt-2" variant="destructive">
                  <AlertDescription>{removeState.error}</AlertDescription>
                </Alert>
              ) : null}
            </form>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            {tMod("markDisputedDesc")}
          </p>
          <form action={markAction}>
            <input type="hidden" name="report_id" value={id} />
            <Button
              type="submit"
              disabled={markPending}
              variant="outline"
            >
              {markPending ? tMod("markingEllipsis") : tMod("markDisputed")}
            </Button>
            {markState.error ? (
              <Alert className="mt-2" variant="destructive">
                <AlertDescription>{markState.error}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </div>
      )}
    </li>
  );
}
