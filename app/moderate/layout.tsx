import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole, isModerator } from "@/lib/moderation";
import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

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
        <EmptyState title="Not authorized" description="This area is for moderators and admins only." />
      </div>
    );
  }

  const nav = [
    { href: "/moderate", label: "Overview" },
    { href: "/moderate/submissions", label: "Submissions" },
    { href: "/moderate/reports", label: "Reports" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"><ShieldCheck className="size-6" /></div><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Staff workspace</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Moderation</h1><p className="mt-2 text-sm text-muted-foreground">Keep the anthology accurate, respectful, and well sourced.</p></div></div>
      <nav className="mb-8 flex flex-wrap gap-2 border-b border-border/70 pb-4">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}