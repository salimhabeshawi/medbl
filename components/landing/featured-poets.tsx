import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "./reveal";
import { LandingSection, SectionHeading } from "./section";

type FeaturedPoetRow = {
  id: string;
  name_am: string;
  name_en: string | null;
  poem_count: number;
};

export async function LandingFeaturedPoets({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_featured_poets", { p_limit: 4 });
  const poets = (data as FeaturedPoetRow[] | null) ?? [];
  if (poets.length === 0) return null;

  const t = await getTranslations("Landing");
  const tPoets = await getTranslations("Poets");
  return (
    <LandingSection labelledBy="featured-poets-title">
      <Reveal>
        <SectionHeading
          id="featured-poets-title"
          title={t("featuredPoetsTitle")}
          description={t("featuredPoetsDescription")}
        />
        <Button asChild variant="outline" size="sm" className="mt-5">
          <Link href={authenticated ? "/home" : "/signup"}>
            <PenLine aria-hidden="true" />
            {authenticated ? t("meetTheVoices") : t("addYourVoice")}
          </Link>
        </Button>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {poets.map((poet, index) => {
          const poemCount = Number(poet.poem_count);
          return (
            <Reveal key={poet.id} delay={index * 90}>
              <Link
                href={`/poets/${poet.id}`}
                className={`landing-poet-card landing-poet-card-${(index % 3) + 1} block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50`}
              >
                <p className="font-sans text-lg font-semibold" lang="am">
                  {poet.name_am}
                </p>
                {poet.name_en ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {poet.name_en}
                  </p>
                ) : null}
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {t("poetCardDescription", { count: poemCount })}
                </p>
                <Badge variant="outline" className="mt-5">
                  {tPoets("poemCount", { count: poemCount })}
                </Badge>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </LandingSection>
  );
}
