"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound, ClipboardList, LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useTranslations } from "next-intl";

function initials(email?: string): string {
  if (!email) return "U";
  const raw = email.replace(/@.*$/, "");
  const parts = raw.split(/[._-]+/).filter(Boolean);
  const first = parts[0] ?? raw;
  const last = parts[parts.length - 1] ?? "";
  return (first[0] ?? "U").toUpperCase() + (parts.length > 1 ? (last[0] ?? "").toUpperCase() : (first[1] ?? "").toUpperCase());
}

/**
 * Sign out is an auth request, so it gets the app's standard loading state.
 *
 * It is its own component only so it can call `useFormStatus`, which reports
 * the state of the enclosing `<form action={signOut}>` — the only place the
 * in-flight flag exists, since `signOut` is a bare server action. The button is
 * a plain <button> rather than a shadcn Button because it lives inside
 * DropdownMenuContent, which is styled for the dark sheet, not the card.
 */
function SignOutMenuButton() {
  const { pending } = useFormStatus();
  const tNav = useTranslations("Nav");

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="flex w-full cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
    >
      {pending ? (
        <LoadingSpinner />
      ) : (
        <LogOut className="size-4" />
      )}
      {tNav("logout")}
    </button>
  );
}

export function UserMenu({
  email,
  role,
}: {
  email?: string;
  role: "member" | "moderator" | "admin";
}) {
  const pathname = usePathname();
  const redirectParam = encodeURIComponent(pathname);
  const tNav = useTranslations("Nav");
  const tSubmissions = useTranslations("MySubmissions");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={tNav("accountMenu")}
        >
          <Avatar className="bg-secondary">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {initials(email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-border bg-popover">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-medium text-foreground">
            {email || tNav("signedIn")}
          </span>
          <span className="mt-0.5 block text-xs capitalize text-secondary">
            {role}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/profile?redirect=${redirectParam}`}>
              <UserRound className="text-primary" />
              {tNav("profile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-submissions">
              <ClipboardList className="text-primary" />
              {tSubmissions("title")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={signOut} className="px-1 py-1">
          <SignOutMenuButton />
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
