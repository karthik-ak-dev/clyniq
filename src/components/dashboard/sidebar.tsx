"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2.5 10.833V4.167A1.667 1.667 0 0 1 4.167 2.5h4.166v8.333H2.5ZM2.5 17.5v-4.167h5.833V17.5H4.167A1.667 1.667 0 0 1 2.5 17.5ZM10.833 17.5v-8.333H17.5v4.166a1.667 1.667 0 0 1-1.667 1.667h-5ZM10.833 7.5V2.5h5A1.667 1.667 0 0 1 17.5 4.167V7.5h-6.667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Inbox",
    href: "/inbox",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2.5 5.833A1.667 1.667 0 0 1 4.167 4.167h11.666A1.667 1.667 0 0 1 17.5 5.833v8.334a1.667 1.667 0 0 1-1.667 1.666H4.167A1.667 1.667 0 0 1 2.5 14.167V5.833Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m2.5 5.833 7.5 5 7.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13.333 1.667v3.333M6.667 1.667v3.333M2.5 7.5h15M4.167 3.333h11.666A1.667 1.667 0 0 1 17.5 5v11.667a1.667 1.667 0 0 1-1.667 1.666H4.167A1.667 1.667 0 0 1 2.5 16.667V5a1.667 1.667 0 0 1 1.667-1.667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Patients",
    href: "/patients",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13.333 17.5v-1.667a3.333 3.333 0 0 0-3.333-3.333H6.667a3.333 3.333 0 0 0-3.334 3.333V17.5M8.333 9.167a3.333 3.333 0 1 0 0-6.667 3.333 3.333 0 0 0 0 6.667ZM16.667 17.5v-1.667a3.333 3.333 0 0 0-2.5-3.225M14.167 2.608a3.333 3.333 0 0 1 0 6.459" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.167 12.5a1.375 1.375 0 0 0 .275 1.517l.05.05a1.667 1.667 0 1 1-2.359 2.358l-.05-.05a1.375 1.375 0 0 0-1.516-.275 1.375 1.375 0 0 0-.834 1.258v.142a1.667 1.667 0 0 1-3.333 0v-.075a1.375 1.375 0 0 0-.9-1.258 1.375 1.375 0 0 0-1.517.275l-.05.05a1.667 1.667 0 1 1-2.358-2.359l.05-.05A1.375 1.375 0 0 0 3.9 12.567a1.375 1.375 0 0 0-1.258-.834h-.142a1.667 1.667 0 0 1 0-3.333h.075a1.375 1.375 0 0 0 1.258-.9 1.375 1.375 0 0 0-.275-1.517l-.05-.05a1.667 1.667 0 1 1 2.359-2.358l.05.05a1.375 1.375 0 0 0 1.516.275h.067a1.375 1.375 0 0 0 .833-1.258v-.142a1.667 1.667 0 0 1 3.334 0v.075a1.375 1.375 0 0 0 .833 1.258 1.375 1.375 0 0 0 1.517-.275l.05-.05a1.667 1.667 0 1 1 2.358 2.359l-.05.05a1.375 1.375 0 0 0-.275 1.516v.067a1.375 1.375 0 0 0 1.258.833h.142a1.667 1.667 0 0 1 0 3.334h-.075a1.375 1.375 0 0 0-1.258.833Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* ─── Promo Banner ──────────────────────────────────── */}
      <div className="mt-5 overflow-clip rounded-2xl bg-primary-light px-4.5 pt-6 pb-4.5">
        <p className="text-3xl font-bold text-primary-dark tracking-tight leading-tight">
          Level Up Your Practice
        </p>
        <p className="mt-3 text-md text-dark-grey leading-normal">
          DoctorRx Pro gives you full control with advanced modules.
        </p>
        <button className="mt-5.5 w-full rounded-lg bg-primary px-4.5 py-3 text-xl font-semibold text-white transition-colors hover:bg-primary-dark">
          Get DoctorRx Pro
        </button>
      </div>
    </aside>
  );
}
