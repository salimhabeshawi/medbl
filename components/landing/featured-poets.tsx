import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal, RevealGroup } from "./reveal";

export async function LandingFeaturedPoets({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const t = await getTranslations("Landing");
  const tPoets = await getTranslations("Poets");
  const poets = [
    [t("samplePoetOneAm"), t("samplePoetOneEn"), 8],
    [t("samplePoetTwoAm"), t("samplePoetTwoEn"), 5],
    [t("samplePoetThreeAm"), t("samplePoetThreeEn"), 11],
    [t("samplePoetFourAm"), t("samplePoetFourEn"), 6],
  ] as const;
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
      aria-labelledby="featured-poets-title"
    >
      <Reveal>
        <h2
          id="featured-poets-title"
          className="font-serif text-3xl font-semibold sm:text-5xl"
        >
          {t("featuredPoetsTitle")}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {t("featuredPoetsDescription")}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-5">
          <a href={authenticated ? "/home" : "/signup"}>
            <PenLine aria-hidden="true" />
            {authenticated ? t("meetTheVoices") : t("addYourVoice")}
          </a>
        </Button>
      </Reveal>
      <RevealGroup>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {poets.map(([nameAm, nameEn, poemCount], index) => (
            <Reveal key={nameAm} delay={index * 90}>
              <div
                className={`landing-poet-card landing-poet-card-${index % 4} rounded-lg border border-border bg-card p-5`}
              >
                <p className="font-sans text-lg font-semibold" lang="am">
                  {nameAm}
                </p>
                {nameEn ? (
                  <p className="mt-1 text-sm text-muted-foreground">{nameEn}</p>
                ) : null}
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {t("poetCardDescription", { count: poemCount })}
                </p>
                <Badge variant="outline" className="mt-5">
                  {tPoets("poemCount", { count: poemCount })}
                </Badge>
              </div>
            </Reveal>
          ))}
        </div>
      </RevealGroup>
    </section>
  );
}
