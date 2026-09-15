"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const tFooter = useTranslations("Footer");

  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
        <p className="font-sans text-base font-semibold text-primary">
          መድብል
        </p>
        <p className="font-serif text-sm italic text-secondary">
          {tFooter("tagline")}
        </p>
        <nav className="flex gap-4 text-sm text-muted-foreground" aria-label="Legal">
          <Link href="/terms" className="hover:text-primary hover:underline">
            {tFooter("terms")}
          </Link>
          <Link href="/privacy" className="hover:text-primary hover:underline">
            {tFooter("privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
