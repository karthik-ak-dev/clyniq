"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { MobileHeader } from "@/components/dashboard/mobile-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-dvh bg-surface">
        <Sidebar />

        {/* Main content — offset by sidebar on desktop */}
        <main className="flex min-h-dvh flex-col lg:ml-sidebar">
          {/* Mobile header (hidden on desktop) */}
          <MobileHeader />

          {/* Desktop content shell — single padding + gap-based spacing */}
          <div className="flex flex-1 flex-col gap-section px-4 py-section md:px-6 lg:px-6">
            <DashboardHeader />
            <div className="flex-1">{children}</div>
            <DashboardFooter />
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
