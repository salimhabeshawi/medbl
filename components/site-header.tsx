import Link from "next/link";
import { getCurrentUserWithRole, isModerator } from "@/lib/moderation";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { SubmissionMenu } from "./submission-menu";

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
};

export async function SiteHeader() {
  const user = await getCurrentUserWithRole();
  const isStaff = user ? isModerator(user.role) : false;
  const role = user?.role ?? null;

  // Full set of nav links, gated by auth state. The mobile Sheet renders
  // them vertically; the desktop bar and dropdown split them inline.
  const links: NavLink[] = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/poems", label: "Poems", icon: "poems" },
    { href: "/poets", label: "Poets", icon: "poets" },
    ...(user ? [{ href: "/favorites", label: "Favorites", icon: "favorites" as const }] : []),
    ...(user
      ? [{ href: "/profile", label: "Profile", icon: "profile" as const }]
      : []),
    ...(isStaff
      ? [{ href: "/moderate", label: "Moderate", icon: "moderate" as const }]
      : []),
  ];

  // Public browse links shown always; account/profile links live in the
  // avatar dropdown on desktop.
  const browseLinks: NavLink[] = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/poems", label: "Poems", icon: "poems" },
    { href: "/poets", label: "Poets", icon: "poets" },
    ...(user ? [{ href: "/favorites", label: "Favorites", icon: "favorites" as const }] : []),
    ...(isStaff
      ? [{ href: "/moderate", label: "Moderate", icon: "moderate" as const }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 md:py-3.5">
        <Link
          href="/"
          className="font-sans text-lg font-semibold text-primary transition hover:text-primary/80 md:text-xl"
        >
          መድብል
        </Link>

        {/* Desktop nav (md and up) - no hamburger */}
        <div className="flex items-center gap-4"><DesktopNav links={browseLinks} />{user ? <div className="hidden md:block"><SubmissionMenu /></div> : null}</div>

        <div className="flex items-center gap-3">
          {/* Desktop auth controls */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {user ? (
              <UserMenu email={user.email} role={user.role} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-foreground transition hover:text-primary">
                  Log in
                </Link>
                <Button asChild size="sm">
                  <Link href="/signup">Sign up</Link>
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
