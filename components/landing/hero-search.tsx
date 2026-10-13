import Form from "next/form";
import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SubmitButton } from "@/components/submit-button";

/**
 * Search straight from the hero. A plain GET form to /poems?q=…, so it works
 * without JavaScript (the landing page's progressive-enhancement rule); with
 * JS, next/form turns it into a client navigation and prefetches /poems'
 * loading skeleton while the form is on screen.
 */
export async function HeroSearch() {
  const t = await getTranslations("Search");

  return (
    <Form
      action="/poems"
      role="search"
      className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-card/90 p-1.5 pl-3.5 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-ring/25"
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <label htmlFor="hero-search" className="sr-only">
        {t("placeholder")}
      </label>
      <input
        id="hero-search"
        name="q"
        type="search"
        required
        enterKeyHint="search"
        autoComplete="off"
        placeholder={t("placeholder")}
        // 16px text keeps iOS Safari from zooming the page on focus.
        className="min-w-0 flex-1 bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground/80"
      />
      <SubmitButton size="lg" aria-label={t("button")} pendingLabel={t("button")}>
        <Search aria-hidden="true" className="sm:hidden" />
        <span className="hidden sm:inline">{t("button")}</span>
      </SubmitButton>
    </Form>
  );
}
