import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only allow same-app relative paths as redirect targets.
function internalPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

const errorRedirect = (origin: string, message: string) =>
  NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(message)}`,
  );

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return errorRedirect(
      origin,
      "Sign-in was not completed. Please try again.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return errorRedirect(
      origin,
      "Sign-in failed. Please try again.",
    );
  }

  const target = internalPath(next) ?? "/";
  return NextResponse.redirect(`${origin}${target}`);
}