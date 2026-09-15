import Link from "next/link";
import { login } from "@/app/actions";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackLink } from "@/components/back-link";
import { getTranslations } from "next-intl/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next } = await searchParams;
  const tAuth = await getTranslations("Auth");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <BackLink href="/">{tAuth("backHome")}</BackLink>
        <Card className="w-full border-primary/15 shadow-lg">
          <CardContent className="p-8">
            <h1 className="mb-6 text-2xl font-bold">{tAuth("loginTitle")}</h1>

            {error ? (
              <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
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

            <form action={login} className="form-stack">
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
                  autoComplete="current-password"
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </label>
              <Button type="submit" className="w-full">
                {tAuth("loginBtn")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {tAuth("noAccount")}{" "}
              <Link href="/signup" className="font-medium underline">
                {tAuth("signup")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
