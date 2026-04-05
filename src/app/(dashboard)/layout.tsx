"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar, BottomNav } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

// ─── Dashboard Layout ──────────────────────────────────────
// Desktop: fixed sidebar (250px) + header + scrollable content.
// Mobile: header + scrollable content + fixed bottom nav.
// White background, clean professional feel.
// SessionProvider wraps everything so useSession() works in children.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-dvh bg-gray-50">
        {/* Sidebar — desktop only */}
        <Sidebar />

        {/* Main content area — offset by sidebar width on desktop */}
        <div className="md:ml-[250px] flex flex-col min-h-dvh">
          <Header />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
        </div>

        {/* Bottom nav — mobile only */}
        <BottomNav />
      </div>
    </SessionProvider>
  );
}
