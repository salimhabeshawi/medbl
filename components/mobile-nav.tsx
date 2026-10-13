"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";
import { ModerationDot } from "@/components/moderation-dot";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { LogIn, LogOut, Menu, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { isActivePath, navIcons, type NavIcon, type NavLink } from "@/lib/nav";

/** One row of the sheet. Closes the sheet on navigation. */
function MobileNavItem({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: NavIcon;
  active: boolean;
  children: ReactNode;
}) {
  const Icon = navIcons[icon];

  return (
    <SheetClose asChild>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={
          active
            ? "flex items-center gap-3 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-foreground transition"
            : "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent/60"
        }
      >
        <Icon className="size-4 text-primary" aria-hidden="true" />
        {children}
      </Link>
    </SheetClose>
  );
}

export function MobileNav({
  links,
  role,
}: {
  links: NavLink[];
  role: "member" | "moderator" | "admin" | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const redirectParam = encodeURIComponent(pathname);
  const tNav = useTranslations("Nav");
  const tSubmit = useTranslations("Submit");
  const tSubmissions = useTranslations("MySubmissions");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="border-border bg-background text-foreground md:hidden"
          aria-label={tNav("menu")}
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-72 gap-0 border-l-foreground/20 bg-background p-0 text-foreground"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-border p-4">
          <SheetTitle>
            <Logo variant="lockup-horizontal" className="h-10 text-foreground" />
          </SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-foreground hover:bg-accent hover:text-foreground"
              aria-label={tNav("closeMenu")}
            >
              <X />
            </Button>
          </SheetClose>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-1 py-3">
          {links.map((link) => (
            <MobileNavItem
              key={link.href}
              href={link.href}
              icon={link.icon}
              active={isActivePath(pathname, link.href)}
            >
              {link.label}
              {link.dot ? <ModerationDot /> : null}
            </MobileNavItem>
          ))}
          {role ? (
            <>
              <div className="mx-3 my-2 h-px bg-border" />
              <MobileNavItem
                href={`/profile?redirect=${redirectParam}`}
                icon="profile"
                active={isActivePath(pathname, "/profile")}
              >
                {tNav("profile")}
              </MobileNavItem>
            </>
          ) : null}
        </nav>
        {role ? (
          <div className="border-t border-border px-1 py-3">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {tNav("submit")}
            </p>
            <div className="flex flex-col gap-1">
              <MobileNavItem
                href="/submit"
                icon="submit"
                active={isActivePath(pathname, "/submit")}
              >
                {tSubmit("title")}
              </MobileNavItem>
              <MobileNavItem
                href="/my-submissions"
                icon="submissions"
                active={isActivePath(pathname, "/my-submissions")}
              >
                {tSubmissions("title")}
              </MobileNavItem>
            </div>
          </div>
        ) : null}
        <ThemeToggle variant="mobile" />
        <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
          {role ? (
            <form action={signOut}>
              <SubmitButton
                variant="ghost"
                className="w-full cursor-pointer justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                {tNav("logout")}
              </SubmitButton>
            </form>
          ) : (
            <>
              <SheetClose asChild>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-border bg-transparent text-foreground hover:bg-accent hover:text-foreground"
                >
                  <Link href="/login">
                    <LogIn className="size-4" />
                    {tNav("login")}
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <Link href="/signup">
                    <Plus className="size-4" />
                    {tNav("signup")}
                  </Link>
                </Button>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
