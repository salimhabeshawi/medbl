import Link from "next/link";
import {
  getCurrentUserWithRole,
  getModerationPendingCounts,
  hasPendingModeration,
  isModerator,
} from "@/lib/moderation";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { SubmissionMenu } from "./submission-menu";
import { LanguageToggle } from "./language-toggle";
import { getTranslations } from "next-intl/server";

type NavIcon =
  | "home"
  | "poems"
  | "poets"
  | "submit"
  | "favorites"
  | "submissions"
  | "profile"
  | "moderate";

type NavLink = {
  href: string;
  label: string;
  icon: NavIcon;
  /** Staff-only: render the pending-moderation dot next to the label. */
  dot?: boolean;
};

export async function SiteHeader() {
  const user = await getCurrentUserWithRole();
  const isStaff = user ? isModerator(user.role) : false;
  const role = user?.role ?? null;
  const tNav = await getTranslations("Nav");

  // Fetched here, next to the role check that decides whether the Moderation
  // link renders at all, so the dot costs one staff-only RPC on page load and
  // nothing at all for signed-out visitors and members. No polling: it simply
  // reflects the totals as of this render. Moderation actions revalidate the
  // root layout, so it also refreshes right after a review.
  const showModerationDot = isStaff
    ? hasPendingModeration(await getModerationPendingCounts())
    : false;

  const links: NavLink[] = [
    { href: "/", label: tNav("home"), icon: "home" },
    { href: "/poems", label: tNav("poems"), icon: "poems" },
    { href: "/poets", label: tNav("poets"), icon: "poets" },
    ...(user
      ? [
          {
            href: "/favorites",
            label: tNav("favorites"),
            icon: "favorites" as const,
          },
        ]
      : []),
    ...(user
      ? [{ href: "/profile", label: tNav("profile"), icon: "profile" as const }]
      : []),
    ...(isStaff
      ? [
          {
            href: "/moderate",
            label: tNav("moderate"),
            icon: "moderate" as const,
            dot: showModerationDot,
          },
        ]
      : []),
  ];

  const browseLinks: NavLink[] = [
    { href: "/", label: tNav("home"), icon: "home" },
    { href: "/poems", label: tNav("poems"), icon: "poems" },
    { href: "/poets", label: tNav("poets"), icon: "poets" },
    ...(user
      ? [
          {
            href: "/favorites",
            label: tNav("favorites"),
            icon: "favorites" as const,
          },
        ]
      : []),
    ...(isStaff
      ? [
          {
            href: "/moderate",
            label: tNav("moderate"),
            icon: "moderate" as const,
            dot: showModerationDot,
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 md:py-3.5">
        <Link
          href="/"
          className="font-sans text-lg font-semibold text-primary transition hover:text-primary/80 md:text-xl"
        >
          {tNav("medbl")}
        </Link>

        {/* Desktop nav (md and up) - no hamburger */}
        <div className="flex items-center gap-4">
          <DesktopNav links={browseLinks} />
          {user ? (
            <div className="hidden md:block">
              <SubmissionMenu />
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          {/* Desktop auth controls */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {user ? (
              <UserMenu email={user.email} role={user.role} />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground transition hover:text-primary"
                >
                  {tNav("login")}
                </Link>
                <Button asChild size="sm">
                  <Link href="/signup">{tNav("signup")}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger (below md) */}
          <MobileNav links={links} role={role} />
        </div>
      </div>
    </header>
  );
}
