"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function SignupForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [agreed, setAgreed] = useState(false);
  const tAuth = useTranslations("Auth");
  const tFooter = useTranslations("Footer");

  return (
    <form action={action} className="form-stack">
      <label className="flex flex-col gap-1 text-sm font-medium">
        {tAuth("emailLabel")}
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {tAuth("passwordLabel")}
        <Input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>
      <label className="flex items-start gap-2 text-sm font-normal leading-6">
        <input
          type="checkbox"
          required
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="mt-1 size-4 accent-primary"
        />
        <span>
          {tAuth("agreementPrefix")} {" "}
          <Link href="/terms" className="font-medium text-primary underline">
            {tFooter("terms")}
          </Link>{" "}
          {tAuth("agreementAnd")} {" "}
          <Link href="/privacy" className="font-medium text-primary underline">
            {tFooter("privacy")}
          </Link>
        </span>
      </label>
      <Button type="submit" disabled={!agreed} className="w-full">
        {tAuth("signupBtn")}
      </Button>
    </form>
  );
}