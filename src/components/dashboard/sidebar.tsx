"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// ─── SVG Icons ─────────────────────────────────────────────

function IconPatients({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#5b21b6" : "#8e8aa0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="5.5" r="3" />
      <path d="M1.5 16c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="13" cy="6" r="2" />
      <path d="M13 10c2 0 3.5 1.2 3.5 3.5" />
    </svg>
  );
}

function IconAddPatient({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#5b21b6" : "#8e8aa0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="6" r="3.5" />
      <path d="M2 16.5c0-3.5 2.7-5.5 6-5.5" />
      <line x1="14" y1="11" x2="14" y2="17" />
      <line x1="11" y1="14" x2="17" y2="14" />
    </svg>
  );
}

function IconTemplates({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#5b21b6" : "#8e8aa0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1.5" width="14" height="15" rx="2" />
      <line x1="5.5" y1="6" x2="12.5" y2="6" />
      <line x1="5.5" y1="9.5" x2="12.5" y2="9.5" />
      <line x1="5.5" y1="13" x2="9.5" y2="13" />
    </svg>
  );
}

function IconSettings({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#5b21b6" : "#8e8aa0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.1 3.1l1.4 1.4M13.5 13.5l1.4 1.4M3.1 14.9l1.4-1.4M13.5 4.5l1.4-1.4" />
    </svg>
  );
}

// ─── Sidebar ───────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Patients", href: "/dashboard", Icon: IconPatients },
  { label: "Add Patient", href: "/patients/add", Icon: IconAddPatient },
  { label: "Templates", href: "/templates", Icon: IconTemplates },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const doctorName = session?.user?.name || "Doctor";
  const doctorEmail = session?.user?.email || "";
  const initials = doctorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || (pathname.startsWith("/patients") && pathname !== "/patients/add");
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-[240px] md:fixed md:inset-y-0"
      style={{
        background: "linear-gradient(180deg, #d8cef0 0%, #e0d8f2 100%)",
        boxShadow: "4px 0 20px rgba(124,58,237,0.08), 1px 0 0 rgba(124,58,237,0.06)",
      }}
    >
      {/* Logo — 3D embossed */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
        <div
          style={{
            paddingBottom: "3px",
            background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
            borderRadius: "0.6rem",
            boxShadow: "0 3px 10px rgba(109,40,217,0.35)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
          >
            <span className="text-white text-xs" style={{ fontWeight: 700 }}>C</span>
          </div>
        </div>
        <div>
          <p className="text-[0.88rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>Clyniq</p>
          <p className="text-[0.6rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>Doctor</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className="block">
              {active ? (
                /* Active: 3D raised pill — outer darker edge + inner white face */
                <div
                  style={{
                    paddingBottom: "2px",
                    background: "linear-gradient(180deg, rgba(124,58,237,0.12), rgba(124,58,237,0.18))",
                    borderRadius: "0.75rem",
                    boxShadow: "0 2px 6px rgba(124,58,237,0.08)",
                  }}
                >
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{
                      fontWeight: 600,
                      fontSize: "0.84rem",
                      color: "#5b21b6",
                      background: "rgba(255,255,255,0.85)",
                    }}
                  >
                    <item.Icon active={true} />
                    {item.label}
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/30"
                  style={{
                    fontWeight: 400,
                    fontSize: "0.84rem",
                    color: "#5a5773",
                  }}
                >
                  <item.Icon active={false} />
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3" style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }} />

        {/* Settings */}
        <Link href="/settings" className="block">
          {pathname === "/settings" ? (
            <div
              style={{
                paddingBottom: "2px",
                background: "linear-gradient(180deg, rgba(124,58,237,0.12), rgba(124,58,237,0.18))",
                borderRadius: "0.75rem",
                boxShadow: "0 2px 6px rgba(124,58,237,0.08)",
              }}
            >
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  fontWeight: 600,
                  fontSize: "0.84rem",
                  color: "#5b21b6",
                  background: "rgba(255,255,255,0.85)",
                }}
              >
                <IconSettings active={true} />
                Settings
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/30"
              style={{
                fontWeight: 400,
                fontSize: "0.84rem",
                color: "#5a5773",
              }}
            >
              <IconSettings active={false} />
              Settings
            </div>
          )}
        </Link>
      </nav>

      {/* Doctor profile — 3D card */}
      <div className="px-3 pb-2">
        <div
          style={{
            paddingBottom: "2px",
            background: "linear-gradient(180deg, rgba(124,58,237,0.08), rgba(124,58,237,0.14))",
            borderRadius: "0.85rem",
          }}
        >
          <div
            className="flex items-center gap-2.5 px-3 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <div
              style={{
                paddingBottom: "2px",
                background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
                borderRadius: "9999px",
                boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
              >
                <span className="text-white text-[0.6rem]" style={{ fontWeight: 600 }}>{initials}</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.78rem] truncate" style={{ fontWeight: 600, color: "#2d2b3d" }}>{doctorName}</p>
              <p className="text-[0.62rem] truncate" style={{ fontWeight: 400, color: "#8e8aa0" }}>{doctorEmail}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/50"
              title="Sign out"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8e8aa0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6" />
                <path d="M10.5 11.5L14 8l-3.5-3.5" />
                <line x1="5.5" y1="8" x2="14" y2="8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-[0.58rem]" style={{ fontWeight: 400, color: "#b8b3cc" }}>
          Privacy Policy · Terms of Service
        </p>
      </div>
    </aside>
  );
}

// ─── Bottom Nav (Mobile) ───────────────────────────────────
export function BottomNav() {
  const pathname = usePathname();
  const items = [
    { label: "Patients", href: "/dashboard", Icon: IconPatients },
    { label: "Add", href: "/patients/add", Icon: IconAddPatient },
    { label: "Templates", href: "/templates", Icon: IconTemplates },
    { label: "Settings", href: "/settings", Icon: IconSettings },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white flex justify-around py-2.5 z-50"
      style={{ boxShadow: "0 -4px 16px rgba(124,58,237,0.06), 0 -1px 0 rgba(124,58,237,0.04)" }}
    >
      {items.map((item) => {
        const active = item.href === "/dashboard"
          ? pathname === "/dashboard" || (pathname.startsWith("/patients") && pathname !== "/patients/add")
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2 py-1"
          >
            <item.Icon active={active} />
            <span
              className="text-[0.58rem]"
              style={{ fontWeight: active ? 600 : 400, color: active ? "#7c3aed" : "#8e8aa0" }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
