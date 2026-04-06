"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar, BottomNav } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-dvh" style={{ background: "#e4ddf5" }}>
        <Sidebar />
        <div className="md:ml-[240px] flex flex-col min-h-dvh">
          <main className="flex-1 px-5 md:px-8 pt-6 py-5 pb-20 md:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </SessionProvider>
  );
}
