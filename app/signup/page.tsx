import Link from "next/link";
import { signup } from "@/app/actions";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";
import { BackLink } from "@/components/back-link";
import { getTranslations } from "next-intl/server";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const tAuth = await getTranslations("Auth");

  return (
    <AuthShell
      title={tAuth("signupTitle")}
      backLink={<BackLink fallbackHref="/home">{tAuth("backHome")}</BackLink>}
      error={error}
    >
      <GoogleAuthButton next={typeof next === "string" ? next : undefined} />

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        {tAuth("or")}
        <div className="h-px flex-1 bg-border" />
      </div>

      <SignupForm
        action={signup}
        next={typeof next === "string" ? next : undefined}
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {tAuth("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline underline-offset-4"
        >
          {tAuth("login")}
        </Link>
      </p>
    </AuthShell>
  );
}
