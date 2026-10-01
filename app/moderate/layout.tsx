import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole, isModerator } from "@/lib/moderation";
import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ModerateNav } from "@/components/moderate-nav";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Moderation" };

export default async function ModerateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUserWithRole();
  const tMod = await getTranslations("Moderate");

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"><ShieldCheck className="size-6" /></div><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">{tMod("staffWorkspace")}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tMod("dashboardTitle")}</h1><p className="mt-2 text-sm text-muted-foreground">{tMod("dashboardSubtitle")}</p></div></div>
      <ModerateNav />
      {children}
    </div>
  );
}