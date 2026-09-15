import Link from "next/link";
import { signup } from "@/app/actions";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <BackLink href="/">{tAuth("backHome")}</BackLink>
        <Card className="w-full border-primary/15 shadow-lg">
          <CardContent className="p-8">
            <h1 className="mb-6 text-2xl font-bold">{tAuth("signupTitle")}</h1>

            {error ? (
              <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <GoogleAuthButton
              next={typeof next === "string" ? next : undefined}
            />

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              {tAuth("or")}
              <div className="h-px flex-1 bg-border" />
            </div>

            <SignupForm action={signup} />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {tAuth("hasAccount")}{" "}
              <Link href="/login" className="font-medium underline">
                {tAuth("login")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
