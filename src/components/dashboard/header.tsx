"use client";

import { useSession } from "next-auth/react";

// ─── Header ────────────────────────────────────────────────
// Top bar for dashboard pages. Shows greeting + doctor avatar.
// Matched to design/doc_flow — clean, white bg, subtle border.

export function Header() {
  const { data: session } = useSession();
  const doctorName = session?.user?.name || "Doctor";
  const firstName = doctorName.split(" ").pop() || doctorName;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-700 text-gray-900">
          {greeting}, {firstName} 👋
        </h1>
      </div>

      {/* Avatar with initials */}
      <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center">
        <span className="text-white text-sm font-700">
          {doctorName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      </div>
    </header>
  );
}
