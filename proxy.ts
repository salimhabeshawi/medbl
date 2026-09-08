import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Cookie-based locale detection: the NEXT_LOCALE cookie is read in
// i18n/request.ts on every server-render. No next-intl routing middleware
// is needed here — the withNextIntl plugin in next.config.ts wires up
// getRequestConfig automatically. Only the Supabase auth session refresh
// needs to run on every request.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
