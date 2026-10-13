import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/relations";
import { Folio } from "@/components/manuscript/folio";
import { Ornament } from "@/components/manuscript/ornament";

/**
 * The newest published poem, set on a tilted manuscript sheet beside the
 * hero headline (large screens only). Streams in behind the hero via
 * Suspense, and renders nothing when the archive is empty.
 */
export async function HeroVerse() {
  const supabase = await createClient();
  const { data: poem } = await supabase
    .from("poems")
    .select("id, title, body, poem_number, poets(name_am)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!poem) return null;

  const t = await getTranslations("Landing");
  const poet = firstRelation<{ name_am: string }>(poem.poets);
  const excerpt: string[] = String(poem.body)
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <Link
      href={`/poems/${poem.id}`}
      className="hero-verse manuscript-sheet group block px-8 py-9 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        {t("latestVerse")}
      </p>
      {typeof poem.poem_number === "number" ? (
        <Folio number={poem.poem_number} className="mt-4" />
      ) : null}
      <p className="mt-2 text-balance font-serif text-2xl font-semibold leading-snug text-foreground">
        {poem.title}
      </p>
      <Ornament className="mx-auto my-5 max-w-32" />
      <p className="font-sans text-base leading-8 text-foreground/80">
        {excerpt.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </p>
      {poet?.name_am ? (
        <p className="mt-4 text-sm text-secondary">— {poet.name_am}</p>
      ) : null}
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
        {t("readPoem")}
        <ArrowRight
          className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
