"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Patients",
    href: "/patients",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13.333 17.5v-1.667a3.333 3.333 0 0 0-3.333-3.333H6.667a3.333 3.333 0 0 0-3.334 3.333V17.5M8.333 9.167a3.333 3.333 0 1 0 0-6.667 3.333 3.333 0 0 0 0 6.667ZM16.667 17.5v-1.667a3.333 3.333 0 0 0-2.5-3.225M14.167 2.608a3.333 3.333 0 0 1 0 6.459" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-dvh w-sidebar flex-col bg-sidebar-bg px-4 py-5 lg:flex">
      {/* ─── Logo ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 py-1.75">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M7 14L14 7L21 14L14 21L7 14Z" fill="#35BFA3"/>
          <path d="M3 14L14 3L25 14L14 25L3 14Z" stroke="#35BFA3" strokeWidth="2" fill="none"/>
        </svg>
        <span className="text-3xl font-semibold text-primary-dark tracking-logo leading-tight">DoctorRx</span>
      </div>

      {/* ─── Navigation ────────────────────────────────────── */}
      <nav className="mt-5 flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg pl-3.5 pr-2.5 py-2.5 text-lg font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-dark-grey hover:bg-surface"
              }`}
            >
              <span className={isActive ? "text-white" : "text-dark-grey"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
