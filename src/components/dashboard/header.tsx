"use client";

import { useSession } from "next-auth/react";

// ─── Header ────────────────────────────────────────────────
// Clean, minimal. Just the doctor avatar on the right.
// No notification/chat icons — no functionality for them.

export function Header() {
  const { data: session } = useSession();
  const doctorName = session?.user?.name || "Doctor";
  const initials = doctorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="px-5 md:px-8 py-4 flex items-center justify-end">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: "#7c3aed",
          boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
          border: "2px solid rgba(255,255,255,0.8)",
        }}
      >
        <span className="text-white text-[0.65rem]" style={{ fontWeight: 600 }}>{initials}</span>
      </div>
    </header>
  );
}
