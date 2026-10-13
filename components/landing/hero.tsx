import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";
import { HeroSearch } from "./hero-search";
import { HeroVerse } from "./hero-verse";

export async function LandingHero({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const t = await getTranslations("Landing");

  return (
    <section
      className="landing-hero relative isolate overflow-hidden"
      aria-labelledby="landing-title"
    >
      <div className="landing-noise" aria-hidden="true" />
      <div className="landing-border-motif" aria-hidden="true" />
      <div className="landing-glyph landing-glyph-one" aria-hidden="true">
        ሀ
      </div>
      <div className="landing-glyph landing-glyph-two" aria-hidden="true">
        መ
      </div>
      <div className="landing-glyph landing-glyph-three" aria-hidden="true">
        ግ
      </div>
      <div className="landing-glyph landing-glyph-four" aria-hidden="true">
        ጥ
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16 lg:py-28">
        {/* Above the fold, so no scroll observer: a CSS entrance that starts
            on first paint, without waiting for JavaScript. */}
        <div className="motion-safe:animate-fade-up">
          <h1
            id="landing-title"
            className="flex flex-wrap items-center gap-4 text-foreground sm:gap-6"
          >
            <Logo
              variant="lockup-stacked"
              className="h-40 text-foreground sm:h-52"
            />
            <span className="max-w-xs font-serif text-2xl font-semibold leading-tight sm:text-4xl">
              Where Amharic poetry lives on.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t("subhead")}
          </p>
          <HeroSearch />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={authenticated ? "/home" : "/poems"}>
                <BookOpen aria-hidden="true" />
                {authenticated ? t("goHome") : t("startReading")}
              </Link>
            </Button>
            {!authenticated ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">
                  {t("joinCommunity")}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        {/* Large screens only: phones get the headline, search and actions
            without an extra card to scroll past. */}
        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <HeroVerse />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
