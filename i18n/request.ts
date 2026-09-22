import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "am";
  const validLocale = ["am", "en"].includes(locale) ? locale : "am";

  return {
    locale: validLocale,
    // Global default so date/time formatting is identical on server and
    // client (avoids next-intl's ENVIRONMENT_FALLBACK hydration warning).
    timeZone: "Africa/Addis_Ababa",
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
