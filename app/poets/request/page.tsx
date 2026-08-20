import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PoetRequestForm } from "@/components/poet-request-form";
import { getCurrentUser } from "@/lib/favorites";

export const metadata: Metadata = { title: "Request a poet" };

export default async function PoetRequestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Request a poet</h1>
      <p className="mb-8 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        If a poet you&apos;re looking for isn&apos;t in our registry yet,
        request them. A moderator will review your request before adding them.
        Once approved, you&apos;ll be able to select them when submitting
        poems.
      </p>
      <PoetRequestForm />
    </div>
  );
}