import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";
import { LandingSection, SectionHeading } from "./section";

export async function WhatIsMedbl() {
  const t = await getTranslations("Landing");
  return (
    <LandingSection labelledBy="what-is-medbl">
      <Reveal>
        <SectionHeading
          id="what-is-medbl"
          eyebrow={t("whatEyebrow")}
          title={t("whatTitle")}
        />
        <div className="mt-8 grid gap-6 text-base leading-8 text-foreground/85 sm:text-lg lg:grid-cols-2 lg:divide-x lg:divide-border/70">
          <p className="min-w-0 lg:pr-8">{t("purposeEnglish")}</p>
          <p lang="am" className="min-w-0 font-sans lg:pl-8">
            {t("purposeAmharic")}
          </p>
        </div>
      </Reveal>
    </LandingSection>
  );
}
