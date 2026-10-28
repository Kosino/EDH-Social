import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { getCurrentUser } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "EDH Hub – Social network for Commander players",
  description: "EDH & cEDH social network – decks, events, strategies",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="cs">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          <Sidebar user={user} />
          <div className="min-w-0 flex-1">
            <MobileHeader user={user} />
            <main className="p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
