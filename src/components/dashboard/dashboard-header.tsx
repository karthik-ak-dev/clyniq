"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type PageMeta = { title: string; breadcrumb: string[] };

function getPageMeta(pathname: string): PageMeta {
  if (pathname.startsWith("/patients/add")) return { title: "Add New Patient", breadcrumb: ["Dashboard", "Patients", "Add New"] };
  if (pathname.startsWith("/patients/")) return { title: "Patient Detail", breadcrumb: ["Dashboard", "Patients", "Detail"] };
  if (pathname.startsWith("/patients")) return { title: "Patients", breadcrumb: ["Dashboard", "Patients"] };
  return { title: "Dashboard", breadcrumb: ["Dashboard"] };
}

export function DashboardHeader() {
  const pathname = usePathname();
  const { title, breadcrumb } = getPageMeta(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="hidden items-center justify-between lg:flex">
      {/* Left — Title + Breadcrumb */}
      <div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-black">{title}</h1>
        <p className="mt-1 text-md font-normal leading-normal">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb}>
              {i > 0 && <span className="text-dark-grey">{" / "}</span>}
              <span className={i === breadcrumb.length - 1 ? "text-black" : "text-primary"}>
                {crumb}
              </span>
            </span>
          ))}
        </p>
      </div>

      {/* Right — Notifications + User */}
      <div className="flex items-center gap-2.5">
        <button className="relative flex size-icon-btn items-center justify-center rounded-btn bg-primary-light text-primary-dark transition-colors hover:bg-primary-hover" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M13.5 6a4.5 4.5 0 0 0-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5S13.5 11.25 13.5 6ZM10.298 15.75a1.5 1.5 0 0 1-2.596 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Doctor avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-surface"
          >
            <div className="flex size-avatar-sm items-center justify-center rounded-full bg-primary text-md font-bold text-white">
              Dr
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-lg font-bold leading-tight text-black">Doctor</p>
              <p className="text-base font-normal text-dark-grey">Admin</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-dark-grey">
              <path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white p-1.5 shadow-lg border border-border z-50">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-md font-medium text-red transition-colors hover:bg-red-subtle"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 14H3.333A1.333 1.333 0 0 1 2 12.667V3.333A1.333 1.333 0 0 1 3.333 2H6M10.667 11.333L14 8l-3.333-3.333M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
