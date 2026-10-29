import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { BRAND_NAME } from "@/lib/brand";
import { getCurrentUser } from "@/lib/supabase/session";

const sans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} – MTG Commander Network`,
  description: "EDH & cEDH sociální síť – decky, eventy, články",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="cs" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans text-foreground antialiased">
        <div className="app-shell flex min-h-screen">
          <Sidebar user={user} />
          <div className="app-main min-w-0 flex-1">
            <MobileHeader user={user} />
            <main className="animate-fade-rise p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
