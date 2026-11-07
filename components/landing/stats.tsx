import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { CountUp } from "./count-up";
import { Reveal } from "./reveal";

export async function LandingStats() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_site_stats");
  if (error || !data?.[0]) return null;
  const stats = data[0] as {
    poems_count: number;
    poets_count: number;
    favorites_count: number;
  };
  const t = await getTranslations("Landing");
  const items = [
    ["poems", Number(stats.poems_count)],
    ["poets", Number(stats.poets_count)],
    ["favorites", Number(stats.favorites_count)],
  ] as const;
  return (
    <section
      className="border-y border-border/70 bg-accent/25"
      aria-labelledby="stats-title"
    >
      <h2 id="stats-title" className="sr-only">
        {t("statsTitle")}
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-3 px-4 py-12 sm:gap-5 sm:px-6 sm:py-16">
        {items.map(([key, value]) => (
          <Reveal
            key={key}
            className="rounded-xl border border-border bg-card px-2 py-5 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:px-5 sm:py-7"
          >
            <p className="font-serif text-4xl font-semibold tabular-nums text-primary sm:text-6xl">
              <CountUp value={value} />
            </p>
            <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-sm sm:tracking-[0.15em]">
              {t(`stats${key[0].toUpperCase()}${key.slice(1)}`)}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
