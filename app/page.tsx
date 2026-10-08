import type { Metadata } from "next";
import { LandingHero } from "@/components/landing/hero";
import { WhatIsMedbl } from "@/components/landing/what-is-medbl";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingTrust } from "@/components/landing/trust";
import { LandingFinalCta } from "@/components/landing/final-cta";
import { LandingStats } from "@/components/landing/stats";
import { LandingFeaturedPoem } from "@/components/landing/featured-poem";
import { LandingFeaturedPoets } from "@/components/landing/featured-poets";
import { LandingThemes } from "@/components/landing/themes";

export const metadata: Metadata = {
  title: "Medbl — Amharic Poetry Collection",
  description:
    "Medbl is a community collection of Amharic poetry, where readers discover poems by real poets and members share their own verses.",
  applicationName: "Medbl",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Medbl — Amharic Poetry Collection",
    description: "A community collection of Amharic poetry by real poets.",
    siteName: "Medbl",
    url: "/",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Medbl",
  description:
    "Medbl is a community collection of Amharic poetry by real poets.",
};

export default function LandingPage() {
  const authenticated = false;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <LandingHero authenticated={authenticated} />
      <WhatIsMedbl />
      <LandingStats />
      <HowItWorks />
      <LandingFeaturedPoem authenticated={authenticated} />
      <LandingFeaturedPoets authenticated={authenticated} />
      <LandingThemes authenticated={authenticated} />
      <LandingTrust />
      <LandingFinalCta authenticated={authenticated} />
    </>
  );
}
