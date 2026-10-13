import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "./reveal";
import { LandingSection, SectionHeading } from "./section";

type CategoryRow = {
  id: string;
  name_am: string | null;
  name_en: string;
};

export async function LandingThemes({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name_am, name_en")
    .neq("name_en", "Uncategorized")
    .order("created_at");
  const categories = (data as CategoryRow[] | null) ?? [];
  if (categories.length === 0) return null;

  const locale = await getLocale();
  const t = await getTranslations("Landing");
  return (
    <LandingSection labelledBy="themes-title" band>
      <Reveal>
        <SectionHeading
          id="themes-title"
          eyebrow={t("themesEyebrow")}
          title={t("themesTitle")}
          description={t("themesDescription")}
        />
        <Button asChild variant="outline" size="sm" className="mt-5">
          <Link href={authenticated ? "/home" : "/signup"}>
            <Compass aria-hidden="true" />
            {authenticated ? t("discoverThemes") : t("findYourPlace")}
          </Link>
        </Button>
        <div className="landing-themes mt-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/poems?category=${category.id}`}
              className="landing-theme-pill rounded-lg"
            >
              <Badge
                variant="outline"
                className="h-auto rounded-lg px-4 py-2 text-sm transition-colors hover:border-primary/60 hover:text-primary"
              >
                {locale === "am"
                  ? category.name_am || category.name_en
                  : category.name_en || category.name_am}
              </Badge>
            </Link>
          ))}
        </div>
      </Reveal>
    </LandingSection>
  );
}
