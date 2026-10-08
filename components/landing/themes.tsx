import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";

export async function LandingThemes({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_am, name_en")
    .order("name_am");
  if (error || !data?.length) return null;
  const locale = await getLocale();
  const t = await getTranslations("Landing");
  return (
    <section
      className="border-y border-border/70 bg-accent/25"
      aria-labelledby="themes-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {t("themesEyebrow")}
          </p>
          <h2
            id="themes-title"
            className="font-serif text-3xl font-semibold sm:text-5xl"
          >
            {t("themesTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {t("themesDescription")}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <a href={authenticated ? "/home" : "/signup"}>
              <Compass aria-hidden="true" />
              {authenticated ? t("discoverThemes") : t("findYourPlace")}
            </a>
          </Button>
          <div className="landing-themes mt-8 flex flex-wrap gap-3">
            {data.map((category) => (
              <span key={category.id} className="landing-theme-pill">
                <Badge
                  variant="outline"
                  className="h-auto rounded-lg px-4 py-2 text-sm"
                >
                  {locale === "am"
                    ? category.name_am || category.name_en
                    : category.name_en || category.name_am}
                </Badge>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
