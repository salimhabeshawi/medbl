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

function initials(email?: string): string {
  if (!email) return "U";
  const raw = email.replace(/@.*$/, "");
  const parts = raw.split(/[._-]+/).filter(Boolean);
  const first = parts[0] ?? raw;
  const last = parts[parts.length - 1] ?? "";
  return (first[0] ?? "U").toUpperCase() + (parts.length > 1 ? (last[0] ?? "").toUpperCase() : (first[1] ?? "").toUpperCase());
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Account menu"
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
            {email || "Signed in"}
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
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-submissions">
              <ClipboardList className="text-primary" />
              My submissions
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={signOut} className="px-1 py-1">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
