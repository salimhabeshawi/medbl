import { BookOpen, PenLine, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";
import { LandingSection, SectionHeading } from "./section";

const icons: LucideIcon[] = [BookOpen, PenLine, ShieldCheck];

export async function HowItWorks() {
  const t = await getTranslations("Landing");
  const steps = ["read", "contribute", "review"] as const;
  return (
    <LandingSection labelledBy="how-it-works" band>
      <Reveal>
        <SectionHeading id="how-it-works" title={t("howTitle")} />
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = icons[index];
          return (
            <Reveal key={step} delay={index * 100}>
              <Card className="h-full border-border bg-card shadow-none">
                <CardHeader>
                  <Icon
                    className="mb-4 size-7 text-primary"
                    aria-hidden="true"
                  />
                  <CardTitle className="font-serif text-xl">
                    {t(`${step}Title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="leading-7 text-muted-foreground">
                  {t(`${step}Description`)}
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </LandingSection>
  );
}
