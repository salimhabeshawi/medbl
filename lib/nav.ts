import {
  BookOpen,
  ClipboardList,
  Heart,
  Home,
  Plus,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

/**
 * Shared site-navigation model. The header builds one list of these on the
 * server and hands it to both DesktopNav and MobileNav, so the two never drift.
 */
export const navIcons = {
  home: Home,
  poems: BookOpen,
  poets: UsersRound,
  submit: Plus,
  favorites: Heart,
  submissions: ClipboardList,
  profile: UserRound,
  moderate: ShieldCheck,
};

export type NavIcon = keyof typeof navIcons;

export type NavLink = {
  href: string;
  label: string;
  icon: NavIcon;
  /** Staff-only: render the pending-moderation dot next to the label. */
  dot?: boolean;
};

/** A link is active on its own page and on every page nested beneath it. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
