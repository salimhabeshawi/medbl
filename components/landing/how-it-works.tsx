import { BookOpen, PenLine, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Reveal, RevealGroup } from "./reveal";

const icons: LucideIcon[] = [BookOpen, PenLine, ShieldCheck];

export async function HowItWorks() {
  const t = await getTranslations("Landing");
  const steps = ["read", "contribute", "review"] as const;
  return (
    <section
      className="border-y border-border/70 bg-accent/25"
      aria-labelledby="how-it-works"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <h2
            id="how-it-works"
            className="font-serif text-3xl font-semibold sm:text-5xl"
          >
            {t("howTitle")}
          </h2>
        </Reveal>
        <RevealGroup>
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
        </RevealGroup>
      </div>
    </section>
  );
}
