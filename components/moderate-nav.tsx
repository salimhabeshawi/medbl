"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileCheck2, Flag, LayoutDashboard } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

/**
 * The /moderate sub-navigation, shared by the overview, submissions and reports
 * pages.
 *
 * This used to be a bare `<nav>` of hand-rolled links with hardcoded English
 * labels and no active state at all — nothing told a moderator which queue they
 * were standing in. It is now a row of shadcn pill buttons: the active queue is
 * highlighted through the `default`/`outline` variants, every label comes from
 * the translated `Moderate` namespace, and the row wraps instead of squashing
 * three labels into a narrow phone viewport.
 */
export function ModerateNav() {
  const tMod = useTranslations("Moderate");
  const pathname = usePathname();

  const links = [
    {
      href: "/moderate",
      label: tMod("overview"),
      icon: LayoutDashboard,
    },
    {
      href: "/moderate/submissions",
      label: tMod("submissionsTab"),
      icon: FileCheck2,
    },
    { href: "/moderate/reports", label: tMod("reportsTab"), icon: Flag },
  ];

  return (
    <nav
      aria-label={tMod("dashboardTitle")}
      className="mb-8 flex flex-wrap items-center gap-2 border-b border-border/70 pb-4"
    >
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;

        return (
          <Button
            key={link.href}
            asChild
            size="lg"
            variant={active ? "default" : "outline"}
            className={cn(
              "shrink-0 gap-2",
              !active && "text-muted-foreground hover:text-foreground",
            )}
          >
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
