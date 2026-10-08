import { CheckCircle2 } from "lucide-react";
import { AttributionBadge } from "@/components/attribution-badge";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";

export async function LandingTrust() {
  const t = await getTranslations("Landing");
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
      aria-labelledby="trust-title"
    >
      <Reveal className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            {t("trustEyebrow")}
          </p>
          <h2
            id="trust-title"
            className="font-serif text-3xl font-semibold sm:text-5xl"
          >
            {t("trustTitle")}
          </h2>
        </div>
        <div className="space-y-6">
          <p className="text-base leading-8 text-foreground/85 sm:text-lg">
            {t("trustDescription")}
          </p>
          <div className="flex flex-wrap gap-3">
            <AttributionBadge status="verified" />
            <AttributionBadge status="community" />
            <AttributionBadge status="disputed" />
          </div>
          <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            <CheckCircle2
              className="mt-1 size-4 shrink-0 text-secondary"
              aria-hidden="true"
            />
            {t("trustLabels")}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
