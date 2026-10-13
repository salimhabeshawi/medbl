"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModerationDot } from "./moderation-dot";
import { isActivePath, type NavLink } from "@/lib/nav";

export function DesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-5 text-sm font-medium text-foreground md:flex lg:gap-7">
      {links.map((link) => {
        const active = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              // The underline grows from the left on hover and stays drawn
              // under the active page; colour alone was the only cue before.
              "relative inline-flex items-center gap-1.5 py-1 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-(--duration-base) after:ease-(--ease-out-soft) " +
              (active
                ? "text-primary after:scale-x-100"
                : "after:scale-x-0 hover:text-primary hover:after:scale-x-100")
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
