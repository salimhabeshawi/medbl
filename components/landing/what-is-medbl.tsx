import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";

export async function WhatIsMedbl() {
  const t = await getTranslations("Landing");
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
      aria-labelledby="what-is-medbl"
    >
      <Reveal>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {t("whatEyebrow")}
          </p>
          <h2
            id="what-is-medbl"
            className="font-serif text-3xl font-semibold sm:text-5xl"
          >
            {t("whatTitle")}
          </h2>
        </div>
        <div className="mt-8 grid gap-6 text-base leading-8 text-foreground/85 sm:text-lg lg:grid-cols-2 lg:divide-x lg:divide-border/70">
          <p className="min-w-0 lg:pr-8">{t("purposeEnglish")}</p>
          <p lang="am" className="min-w-0 font-sans lg:pl-8">
            {t("purposeAmharic")}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
