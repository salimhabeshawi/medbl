import type { Metadata } from "next";
import { Noto_Sans_Ethiopic, Lora, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { InstallAppPrompt } from "@/components/install-app-prompt";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale } from "next-intl/server";
import amMessages from "@/messages/am.json";
import enMessages from "@/messages/en.json";

const notoSansEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Medbl — Amharic Poetry Platform",
    template: "%s | Medbl",
  },
  description: "Amharic poetry center — read, honor, share.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${notoSansEthiopic.variable} ${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          Both message sets are loaded server-side once and passed to
          LocaleProvider. Switching locale only updates React state —
          no server round-trip needed for client components to re-render
          in the new language.
        */}
        <LocaleProvider
          initialLocale={locale}
          messagesAm={amMessages}
          messagesEn={enMessages}
        >
          <ThemeProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster />
            <InstallAppPrompt />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
