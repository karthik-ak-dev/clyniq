"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AssetPlaceholder } from "@/components/ui/asset-placeholder";

// ─── Sidebar ───────────────────────────────────────────────
// Desktop: fixed left sidebar with navigation.
// Mobile: hidden (replaced by BottomNav in layout).
// Matched to design/doc_flow — purple accent, clean white bg.

const NAV_ITEMS = [
  { label: "Patients", href: "/dashboard", icon: "👥" },
  { label: "Templates", href: "/templates", icon: "📋" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-[250px] md:fixed md:inset-y-0 bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <AssetPlaceholder width={32} height={32} />
        <span className="text-xl font-800 text-[#7c3aed]">Clyniq</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname.startsWith("/patients")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <span className="text-lg">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Bottom Nav (Mobile) ───────────────────────────────────
// Fixed bottom bar on mobile. Replaces sidebar.
export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { label: "Patients", href: "/dashboard", icon: "👥" },
    { label: "Add", href: "/patients/add", icon: "➕" },
    { label: "Templates", href: "/templates", icon: "📋" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-50">
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard" || (pathname.startsWith("/patients") && pathname !== "/patients/add")
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
              isActive ? "text-[#7c3aed]" : "text-gray-400"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
