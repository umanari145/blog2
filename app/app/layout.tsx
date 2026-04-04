import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteMobileHeader } from "@/components/SiteMobileHeader";
import { SiteSidebar } from "@/components/SiteSidebar";
import "./globals.css";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "blog2",
    template: "%s | blog2",
  },
  description: "技術ブログ · Next.js と Prisma の実験場",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${noto.variable} h-full`}>
      <body className="font-sans flex min-h-dvh flex-col antialiased">
        <SiteMobileHeader />
        <div className="app-shell">
          <div className="app-shell-main flex min-h-0 min-w-0 flex-col">
            <main className="relative w-full min-w-0 flex-1 bg-mesh-light dark:bg-mesh-dark">
              <div className="min-h-full w-full bg-ink-50/35 dark:bg-ink-900/45">
                {children}
              </div>
            </main>
            <SiteFooter />
          </div>
          <SiteSidebar />
        </div>
      </body>
    </html>
  );
}
