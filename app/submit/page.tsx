import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitPoemForm } from "@/components/submit-poem-form";
import { getCurrentUser } from "@/lib/favorites";

export const metadata: Metadata = { title: "Submit a poem" };

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Submit a poem</h1>
      <p className="mb-8 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        Your poem goes to moderator review before it appears publicly —
        nothing is published instantly. Every poem must be attached to a poet
        already in our registry. If the poet isn&apos;t there yet,{" "}
        <Link href="/poets/request" className="underline">
          request to add them first
        </Link>
        , then come back to submit once they&apos;re approved.
      </p>
      <SubmitPoemForm />
    </div>
  );
}