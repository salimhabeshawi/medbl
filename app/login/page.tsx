import Link from "next/link";
import { login } from "@/app/actions";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { AuthShell } from "@/components/auth-shell";
import { BackLink } from "@/components/back-link";
import { getTranslations } from "next-intl/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next } = await searchParams;
  const tAuth = await getTranslations("Auth");
  const tCommon = await getTranslations("Common");

  return (
    <AuthShell
      title={tAuth("loginTitle")}
      backLink={<BackLink fallbackHref="/home">{tAuth("backHome")}</BackLink>}
      error={error}
      message={message}
    >
      <GoogleAuthButton next={typeof next === "string" ? next : undefined} />

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        {tAuth("or")}
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={login} className="form-stack">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {tAuth("emailLabel")}
          <Input type="email" name="email" required autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {tAuth("passwordLabel")}
          <Input
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>
        <SubmitButton
          size="lg"
          className="w-full"
          pendingLabel={tCommon("loading")}
        >
          {tAuth("loginBtn")}
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {tAuth("noAccount")}{" "}
        <Link
          href="/signup"
          className="font-medium text-primary underline underline-offset-4"
        >
          {tAuth("signup")}
        </Link>
      </p>
    </AuthShell>
  );
}
