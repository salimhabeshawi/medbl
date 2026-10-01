"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

type LocaleCtx = {
  locale: string;
  switchLocale: (next: string) => void;
  /**
   * True while the server refresh triggered by a locale switch is still in
   * flight. Consumers (the header's LanguageToggle) disable themselves and show
   * a LoadingSpinner for its duration, so switching language on a slow
   * connection reads as "working" instead of "broken".
   */
  isSwitching: boolean;
};

const LocaleContext = createContext<LocaleCtx>({
  locale: "am",
  switchLocale: () => {},
  isSwitching: false,
});

export function useLocaleSwitch() {
  return useContext(LocaleContext);
}

export function LocaleProvider({
  initialLocale,
  messagesAm,
  messagesEn,
  children,
}: {
  initialLocale: string;
  messagesAm: Messages;
  messagesEn: Messages;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const [isSwitching, startSwitching] = useTransition();
  const router = useRouter();

  function switchLocale(next: string) {
    // 1. Persist so the server uses the right locale on next render
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    // 2. Update <html lang> for accessibility tools immediately
    document.documentElement.lang = next;
    // 3. Instant: swap messages in state — every useTranslations() call
    //    re-renders in the same React flush, zero waiting.
    setLocale(next);
    // 4. Background: refresh server components (nav labels from SiteHeader,
    //    page headings, etc.) without blocking the UI. The refresh runs INSIDE
    //    this transition so `isSwitching` stays true until the new RSC payload
    //    has actually been applied — that is what the toggle's spinner tracks.
    startSwitching(() => {
      router.refresh();
    });
  }

  return (
    <LocaleContext.Provider value={{ locale, switchLocale, isSwitching }}>
      <NextIntlClientProvider
        locale={locale}
        messages={locale === "en" ? messagesEn : messagesAm}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
