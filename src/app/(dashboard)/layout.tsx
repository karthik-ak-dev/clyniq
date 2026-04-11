"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-dvh bg-[#F7F7F7]">
        <Sidebar />
        {/* Main content area — offset by sidebar width on desktop */}
        <main className="lg:ml-[245px]">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
