import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";
import { Logo } from "@/components/brand/logo";

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
      <svg
        className="landing-noise"
        aria-hidden="true"
        width="100%"
        height="100%"
      >
        <filter id="landing-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#landing-grain)"
          opacity="0.08"
        />
      </svg>
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
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <Reveal className="max-w-4xl">
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
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
        </Reveal>
      </div>
    </section>
  );
}
