import type { Metadata } from "next";
import { Noto_Sans_Ethiopic, Lora, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { InstallAppPrompt } from "@/components/install-app-prompt";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

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
  const messages = await getMessages();
  const tFooter = await getTranslations("Footer");

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${notoSansEthiopic.variable} ${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-background py-8">
              <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
                <p className="font-sans text-base font-semibold text-primary">
                  መድብል
                </p>
                <p className="font-serif text-sm italic text-secondary">
                  {tFooter("tagline")}
                </p>
                <nav className="flex gap-4 text-sm text-muted-foreground" aria-label="Legal">
                  <Link href="/terms" className="hover:text-primary hover:underline">
                    {tFooter("terms")}
                  </Link>
                  <Link href="/privacy" className="hover:text-primary hover:underline">
                    {tFooter("privacy")}
                  </Link>
                </nav>
              </div>
            </footer>
            <Toaster />
            <InstallAppPrompt />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
