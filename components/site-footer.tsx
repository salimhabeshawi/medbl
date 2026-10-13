import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title} className="min-w-0">
      <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h2>
      <ul className="space-y-0.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-block py-1.5 text-foreground/85 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function SiteFooter() {
  const tFooter = await getTranslations("Footer");
  const tCommon = await getTranslations("Common");
  const tNav = await getTranslations("Nav");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <Link href="/" aria-label="Medbl">
              <Logo variant="lockup-horizontal" className="h-10 text-foreground" />
            </Link>
            <p className="font-serif text-sm italic text-secondary">
              {tFooter("tagline")}
            </p>
          </div>
          {/* Three short columns side by side even on phones keeps the footer
              compact; each link carries its own vertical padding to stay
              easy to tap. */}
          <div className="grid grid-cols-3 gap-4 text-center md:contents md:text-left">
            <FooterGroup
              title={tFooter("browse")}
              links={[
                { href: "/poems", label: tNav("poems") },
                { href: "/poets", label: tNav("poets") },
              ]}
            />
            <FooterGroup
              title={tFooter("contribute")}
              links={[
                { href: "/submit", label: tNav("submit") },
                { href: "/my-submissions", label: tNav("mySubmissions") },
              ]}
            />
            <FooterGroup
              title={tCommon("legal")}
              links={[
                { href: "/terms", label: tFooter("terms") },
                { href: "/privacy", label: tFooter("privacy") },
              ]}
            />
          </div>
        </div>
        <p className="mt-10 border-t border-border/70 pt-6 text-center text-xs text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Medbl. {tFooter("copyright")}
        </p>
      </div>
    </footer>
  );
}
