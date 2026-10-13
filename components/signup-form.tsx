"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { useTranslations } from "next-intl";

export function SignupForm({
  action,
  next,
}: {
  action: (formData: FormData) => void | Promise<void>;
  next?: string;
}) {
  const [agreed, setAgreed] = useState(false);
  const tAuth = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const tFooter = useTranslations("Footer");

  return (
    <form action={action} className="form-stack">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {tAuth("emailLabel")}
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {tAuth("passwordLabel")}
        <Input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
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
          {tAuth("agreementPrefix")}{" "}
          <Link href="/terms" className="font-medium text-primary underline">
            {tFooter("terms")}
          </Link>{" "}
          {tAuth("agreementAnd")}{" "}
          <Link href="/privacy" className="font-medium text-primary underline">
            {tFooter("privacy")}
          </Link>
        </span>
      </label>
      <SubmitButton
        size="lg"
        className="w-full"
        disabled={!agreed}
        pendingLabel={tCommon("loading")}
      >
        {tAuth("signupBtn")}
      </SubmitButton>
    </form>
  );
}
