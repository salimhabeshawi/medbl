"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  BookOpen,
  Heart,
  Home,
  LogIn,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type LinkDef = {
  href: string;
  label: string;
  icon:
    | "home"
    | "poems"
    | "poets"
    | "submit"
    | "favorites"
    | "profile"
    | "moderate";
};

const icons = {
  home: Home,
  poems: BookOpen,
  poets: UsersRound,
  submit: Plus,
  favorites: Heart,
  profile: UserRound,
  moderate: ShieldCheck,
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav({
  links,
  role,
}: {
  links: LinkDef[];
  role: "member" | "moderator" | "admin" | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const redirectParam = encodeURIComponent(pathname);

  const primaryLinks = links.filter((l) => l.href !== "/profile");
  const profileLink = links.find((l) => l.href === "/profile");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="border-border bg-background text-foreground md:hidden"
          aria-label="Open menu"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-72 gap-0 border-l-foreground/20 bg-background p-0 text-foreground"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-background/15 p-4">
          <SheetTitle className="font-sans text-base font-semibold text-primary">
            መድብል
          </SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-foreground hover:bg-background/10 hover:text-foreground"
              aria-label="Close menu"
            >
              <X />
            </Button>
          </SheetClose>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-1 py-3">
          {primaryLinks.map((link) => {
            const Icon = icons[link.icon];
            const active = isActive(pathname, link.href);

            return (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className={
                    active
                      ? "flex items-center gap-3 rounded-md bg-background/10 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background/15"
                      : "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background/10"
                  }
                >
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  {link.label}
                </Link>
              </SheetClose>
            );
          })}
          {profileLink && role ? (
            <>
              <div className="mx-3 my-2 h-px bg-background/15" />
              <SheetClose asChild>
                <Link
                  href={`${profileLink.href}?redirect=${redirectParam}`}
                  className={
                    isActive(pathname, profileLink.href)
                      ? "flex items-center gap-3 rounded-md bg-background/10 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background/15"
                      : "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background/10"
                  }
                >
                  <UserRound
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  Profile
                </Link>
              </SheetClose>
            </>
          ) : null}
        </nav>
        <ThemeToggle variant="mobile" />
        <div className="mt-auto flex flex-col gap-2 border-t border-background/15 p-4">
          {role ? (
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full cursor-pointer justify-start text-destructive hover:bg-background/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                Log out
              </Button>
            </form>
          ) : (
            <>
              <SheetClose asChild>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-background/20 bg-transparent text-foreground hover:bg-background/10 hover:text-foreground"
                >
                  <Link href="/login">
                    <LogIn className="size-4" />
                    Log in
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <Link href="/signup">
                    <Plus className="size-4" />
                    Sign up
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
