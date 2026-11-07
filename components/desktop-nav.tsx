"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModerationDot } from "./moderation-dot";

type LinkDef = {
  href: string;
  label: string;
  dot?: boolean;
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ links }: { links: LinkDef[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-5 text-sm font-medium text-foreground md:flex lg:gap-7">
      {links.map((link) => {
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "inline-flex items-center gap-1.5 text-primary transition hover:text-primary/80"
                : "inline-flex items-center gap-1.5 transition hover:text-primary"
            }
          >
            {link.label}
            {link.dot ? <ModerationDot /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
