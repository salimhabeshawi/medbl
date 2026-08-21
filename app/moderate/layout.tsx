import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole, isModerator } from "@/lib/moderation";

export const metadata: Metadata = { title: "Moderation" };

export default async function ModerateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/login?error=Please log in to access moderation.");
  }

  if (!isModerator(user.role)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-bold">Not authorized</h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          This area is for moderators and admins only.
        </p>
      </div>
    );
  }

  const nav = [
    { href: "/moderate", label: "Overview" },
    { href: "/moderate/submissions", label: "Submissions" },
    { href: "/moderate/poet-requests", label: "Poet requests" },
    { href: "/moderate/reports", label: "Reports" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Moderation</h1>
      <nav className="mb-8 flex flex-wrap gap-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}