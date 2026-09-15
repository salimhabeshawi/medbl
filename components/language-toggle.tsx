"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocaleSwitch } from "./locale-provider";

export function LanguageToggle() {
  const { locale, switchLocale } = useLocaleSwitch();
  const tNav = useTranslations("Nav");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLocale(locale === "am" ? "en" : "am")}
      className="font-medium tracking-wide text-xs h-8 px-2.5 rounded-md hover:bg-accent hover:text-accent-foreground border border-border/50"
      aria-label={tNav("language")}
    >
      <span className={locale === "am" ? "font-bold text-primary" : "text-muted-foreground"}>አማ</span>
      <span className="mx-1 text-muted-foreground/40">|</span>
      <span className={locale === "en" ? "font-bold text-primary" : "text-muted-foreground"}>EN</span>
    </Button>
  );
}
