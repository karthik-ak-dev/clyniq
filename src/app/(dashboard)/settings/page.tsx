"use client";

import { useSession, signOut } from "next-auth/react";

// ─── Settings Page ─────────────────────────────────────────
// Polished profile view with layered cards.

export default function SettingsPage() {
  const { data: session } = useSession();
  const doctorName = session?.user?.name || "—";
  const doctorEmail = session?.user?.email || "—";
  const initials = doctorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-800 text-gray-900 mb-6">Settings</h1>

      {/* Profile card */}
      <div
        className="bg-white rounded-2xl p-6 mb-5"
        style={{
          boxShadow: "0 2px 0 rgba(139,92,246,0.06), 0 4px 16px rgba(0,0,0,0.04)",
          border: "1px solid rgba(139,92,246,0.06)",
        }}
      >
        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              boxShadow: "0 3px 10px rgba(124,58,237,0.3)",
            }}
          >
            <span className="text-xl font-800 text-white">{initials}</span>
          </div>
          <div>
            <p className="font-800 text-gray-900 text-lg">{doctorName}</p>
            <p className="text-[0.85rem] text-gray-400 font-500">{doctorEmail}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[0.825rem] font-700 text-gray-400 mb-1">Name</label>
            <p className="text-[0.95rem] text-gray-700 font-600">{doctorName}</p>
          </div>
          <div>
            <label className="block text-[0.825rem] font-700 text-gray-400 mb-1">Email</label>
            <p className="text-[0.95rem] text-gray-700 font-600">{doctorEmail}</p>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full py-3.5 rounded-xl text-[0.9rem] font-700 text-red-500 transition-all hover:bg-red-50"
        style={{
          background: "white",
          border: "1.5px solid #fecaca",
          boxShadow: "0 2px 0 rgba(239,68,68,0.06)",
        }}
      >
        Logout
      </button>
    </div>
  );
}
