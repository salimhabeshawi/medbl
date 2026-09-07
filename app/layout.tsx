import type { Metadata } from "next";
import { Noto_Sans_Ethiopic, Lora, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { InstallAppPrompt } from "@/components/install-app-prompt";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${notoSansEthiopic.variable} ${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-background py-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
              <p className="font-sans text-base font-semibold text-primary">
                መድብል
              </p>
              <p className="font-serif text-sm italic text-secondary">
                Amharic poetry, gathered with care.
              </p>
            </div>
          </footer>
          <Toaster />
          <InstallAppPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
