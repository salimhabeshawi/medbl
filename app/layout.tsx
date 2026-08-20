import type { Metadata } from "next";
import { Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const notoSansEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic"],
});

export const metadata: Metadata = {
  title: {
    default: "Medbl — የአማርኛ ግጥም መድረክ",
    template: "%s | Medbl",
  },
  description:
    "የአማርኛ ግጥም ማዕከል — አንብብ፣ አክብር፣ አጋራ።",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="am"
      className={`${notoSansEthiopic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-zinc-500">
          Medbl — የአማርኛ ግጥም መድረክ
        </footer>
      </body>
    </html>
  );
}