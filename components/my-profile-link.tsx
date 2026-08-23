"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Every navigation to /profile carries ?redirect=<current page> so the
// poet-details save returns the user to where they were (AGENTS.md rule).
export function MyProfileLink({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <Link
      href={`/profile?redirect=${encodeURIComponent(pathname)}`}
      className={className}
    >
      My profile
    </Link>
  );
}