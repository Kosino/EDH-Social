import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { BRAND_NAME } from "@/lib/brand";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
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
  const [user, playtestEnabled] = await Promise.all([
    getCurrentUser(),
    isFeatureEnabled("deckbuilder_playtest"),
  ]);

  return (
    <html lang="cs" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <div className="flex min-h-screen">
          <Sidebar user={user} playtestEnabled={playtestEnabled} />
          <div className="min-w-0 flex-1">
            <MobileHeader user={user} playtestEnabled={playtestEnabled} />
            <main className="p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
