import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";

export async function LandingFinalCta({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const t = await getTranslations("Landing");
  return (
    <section
      className="border-y border-primary/55 bg-accent/35 px-4 py-16 text-center text-foreground sm:px-6 sm:py-24"
      aria-labelledby="final-cta-title"
    >
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2
          id="final-cta-title"
          className="font-serif text-3xl font-semibold sm:text-5xl"
        >
          {t("ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          {t("ctaDescription")}
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href={authenticated ? "/submit" : "/signup"}>
            {authenticated ? t("submitPoem") : t("createAccount")}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}
