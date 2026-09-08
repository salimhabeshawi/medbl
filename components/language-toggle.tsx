"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function LanguageToggle() {
  const locale = useLocale();
  const tNav = useTranslations("Nav");
  const router = useRouter();

  const toggleLanguage = () => {
    const nextLocale = locale === "am" ? "en" : "am";
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="font-medium tracking-wide text-xs h-8 px-2.5 rounded-md hover:bg-accent hover:text-accent-foreground border border-border/50"
      aria-label={tNav("language")}
    >
      <span className={locale === "am" ? "font-bold text-primary" : "text-muted-foreground"}>አማ</span>
      <span className="mx-1 text-muted-foreground/40">|</span>
      <span className={locale === "en" ? "font-bold text-primary" : "text-muted-foreground"}>EN</span>
    </Button>
  );
}
