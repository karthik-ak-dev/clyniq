"use client";

import { useSession, signOut } from "next-auth/react";

// ─── Settings Page ─────────────────────────────────────────
// Doctor profile view. Shows name, email, logout button.
// Minimal for MVP — no edit functionality yet.

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-800 text-gray-900 mb-6">Settings</h1>

      {/* Profile card */}
      <div className="card p-6 mb-4">
        <h3 className="font-700 text-gray-900 mb-4">Profile</h3>

        <div className="space-y-4">
          <div>
            <label className="input-label">Name</label>
            <p className="text-gray-700 font-500">
              {session?.user?.name || "—"}
            </p>
          </div>
          <div>
            <label className="input-label">Email</label>
            <p className="text-gray-700 font-500">
              {session?.user?.email || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full p-3 rounded-xl border border-red-200 text-red-500 font-600 text-sm hover:bg-red-50 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
