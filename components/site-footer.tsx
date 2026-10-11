import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";

export async function SiteFooter() {
  const tFooter = await getTranslations("Footer");

  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
        <Link href="/" aria-label="Medbl">
          <Logo
            variant="lockup-horizontal"
            className="h-8 origin-left scale-125 text-foreground"
          />
        </Link>
        <p className="font-serif text-sm italic text-secondary">
          {tFooter("tagline")}
        </p>
        <nav
          className="flex gap-4 text-sm text-muted-foreground"
          aria-label="Legal"
        >
          <Link href="/terms" className="hover:text-primary hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-primary hover:underline">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
