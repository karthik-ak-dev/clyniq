"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Inbox", href: "/inbox" },
  { label: "Calendar", href: "/calendar" },
  { label: "Patients", href: "/patients" },
  { label: "Settings", href: "/settings" },
];

export function MobileHeader({ title }: { title: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 lg:hidden">
        {/* Logo icon */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 14L14 7L21 14L14 21L7 14Z" fill="#35BFA3"/>
          <path d="M3 14L14 3L25 14L14 25L3 14Z" stroke="#35BFA3" strokeWidth="2" fill="none"/>
        </svg>

        {/* Title */}
        <h1 className="text-[18px] font-bold text-[#203430]">{title}</h1>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#63716E]"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </header>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <nav className="border-b border-[#E5E6E6] bg-white px-4 pb-3 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-[14px] font-medium ${
                  isActive
                    ? "bg-[#35BFA3] text-white"
                    : "text-[#63716E]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
