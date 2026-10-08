import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LibraryBig } from "lucide-react";
import { Reveal } from "./reveal";

type Poem = {
  id: string;
  title: string;
  body: string;
  poem_number: number | null;
  poet_name_am: string;
};

export async function LandingFeaturedPoem({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const supabase = await createClient();
  const { data: featured } = await supabase.rpc("get_featured_poems", {
    p_limit: 1,
  });
  let poem = (featured?.[0] ?? null) as
    | (Poem & { poet_name_en?: string | null })
    | null;
  if (!poem) {
    const { data } = await supabase
      .from("poems")
      .select("id, title, body, poem_number, poets(name_am)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const poet = Array.isArray(data?.poets) ? data.poets[0] : data?.poets;
    if (data && poet)
      poem = {
        id: data.id,
        title: data.title,
        body: data.body,
        poem_number: data.poem_number,
        poet_name_am: poet.name_am,
      };
  }
  if (!poem) return null;
  const t = await getTranslations("Landing");
  const excerpt = poem.body.split(/\r?\n/).slice(0, 6).join("\n").trim();
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
      aria-labelledby="featured-poem-title"
    >
      <Reveal>
        <div className="landing-poem-panel relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-none sm:p-10 lg:p-14">
          <span className="landing-poem-number absolute right-5 top-4 font-serif text-5xl font-semibold text-primary/25 sm:right-10 sm:top-7 sm:text-7xl">
            #{poem.poem_number ?? ""}
          </span>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            {t("featuredPoemEyebrow")}
          </p>
          <h2
            id="featured-poem-title"
            className="landing-poem-title max-w-2xl font-serif text-3xl font-semibold sm:text-5xl"
          >
            {poem.title}
          </h2>
          <p className="landing-poem-excerpt mt-7 whitespace-pre-line border-l-2 border-primary/40 pl-4 font-serif text-lg leading-9 text-foreground/85 sm:max-w-2xl sm:text-xl">
            {excerpt}
          </p>
          <p className="mt-6 text-sm text-secondary">
            {t("by")} {poem.poet_name_am}
          </p>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-muted-foreground">
            {t("featuredPoemDescription")}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-6">
            <a href={authenticated ? "/home" : "/signup"}>
              <LibraryBig aria-hidden="true" />
              {authenticated ? t("exploreArchive") : t("joinArchive")}
            </a>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
