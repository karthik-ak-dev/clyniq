"use client";

import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-dvh bg-[#F7F7F7]">
        {children}
      </div>
    </SessionProvider>
  );
}
