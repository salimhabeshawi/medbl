"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocaleSwitch } from "./locale-provider";
import { LoadingSpinner } from "./loading-spinner";

/**
 * The reference implementation of the app-wide loading rule (AGENTS.md
 * "Guidelines for future changes"): a control that triggers a request disables
 * itself and shows a `LoadingSpinner` for the whole duration.
 *
 * Switching locale does two things — an instant client-side message swap, then
 * a server `router.refresh()` for the server-rendered chrome. Only the second
 * one is a request, so the spinner covers exactly that: the toggle is disabled
 * and shows a spinner in place of its `አማ | EN` state until the new payload
 * lands, then returns to normal.
 */
export function LanguageToggle() {
  const { locale, switchLocale, isSwitching } = useLocaleSwitch();
  const tNav = useTranslations("Nav");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLocale(locale === "am" ? "en" : "am")}
      disabled={isSwitching}
      aria-busy={isSwitching || undefined}
      className="font-medium tracking-wide text-xs h-8 px-2.5 rounded-md hover:bg-accent hover:text-accent-foreground border border-border/50"
      aria-label={tNav("language")}
    >
      {isSwitching ? (
        <LoadingSpinner />
      ) : (
        <>
          <span className={locale === "am" ? "font-bold text-primary" : "text-muted-foreground"}>አማ</span>
          <span className="mx-1 text-muted-foreground/40">|</span>
          <span className={locale === "en" ? "font-bold text-primary" : "text-muted-foreground"}>EN</span>
        </>
      )}
    </Button>
  );
}
