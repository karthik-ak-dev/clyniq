"use client";

import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const doctorName = session?.user?.name || "Doctor";
  const initials = doctorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="px-5 md:px-8 py-4 flex items-center justify-end">
      {/* Avatar — 3D embossed circle */}
      <div
        style={{
          paddingBottom: "2px",
          background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
          borderRadius: "9999px",
          boxShadow: "0 3px 10px rgba(124,58,237,0.25)",
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
        >
          <span className="text-white text-[0.65rem]" style={{ fontWeight: 600 }}>{initials}</span>
        </div>
      </div>
    </header>
  );
}
