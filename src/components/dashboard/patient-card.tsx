import Link from "next/link";
import type { Trend } from "@/lib/db/types";

// ─── Patient Row ───────────────────────────────────────────

interface PatientCardProps {
  doctorPatientId: string;
  name: string;
  phone: string;
  condition: string;
  complianceOverall: number;
  trend: Trend;
  lastCheckIn: string | null;
}

export function PatientCard({
  doctorPatientId,
  name,
  phone,
  condition,
  complianceOverall,
  lastCheckIn,
}: PatientCardProps) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const lastCheckInText = lastCheckIn ? formatRelativeDate(lastCheckIn) : "No check-ins";
  const conditionLabel = condition === "diabetes" ? "Diabetes" : "Obesity";

  const status = complianceOverall >= 70
    ? { label: "On Track", color: "#16a34a", bg: "rgba(22,163,74,0.08)" }
    : complianceOverall >= 40
      ? { label: "Moderate", color: "#d97706", bg: "rgba(217,119,6,0.08)" }
      : { label: "High Risk", color: "#dc2626", bg: "rgba(220,38,38,0.08)" };

  return (
    <Link href={`/patients/${doctorPatientId}`} className="block group">
      <div
        className="flex items-center gap-4 px-5 py-4 transition-all group-hover:bg-[#ece7f8] relative"
        style={{ borderBottom: "1px solid #e0daf0" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(124,58,237,0.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
      >
        {/* Hover accent — left purple bar */}
        <div
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {/* Avatar — 3D embossed */}
        <div className="shrink-0"
          style={{
            paddingBottom: "2px",
            background: "linear-gradient(180deg, #d4cbe6, #c8bedd)",
            borderRadius: "9999px",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #e8e2f6, #ddd6ee)" }}
          >
            <span className="text-[0.72rem] text-[#7c3aed]" style={{ fontWeight: 600 }}>{initials}</span>
          </div>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0" style={{ minWidth: "180px" }}>
          <span className="text-[0.88rem] block truncate" style={{ fontWeight: 600, color: "#2d2b3d" }}>{name}</span>
          <p className="text-[0.75rem] mt-0.5" style={{ fontWeight: 400, color: "#8e8aa0" }}>
            {phone} · {conditionLabel}
          </p>
        </div>

        {/* Status badge — subtle 3D */}
        <div className="shrink-0 hidden sm:flex items-center" style={{ minWidth: "110px" }}>
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[0.74rem]"
            style={{
              fontWeight: 600,
              color: status.color,
              background: status.bg,
              boxShadow: "0 2px 0 rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: status.color }}
            />
            {status.label}
          </span>
        </div>

        {/* Score */}
        <div className="shrink-0 hidden sm:block" style={{ minWidth: "60px" }}>
          <span className="text-[0.88rem]" style={{ fontWeight: 700, color: status.color }}>
            {complianceOverall}%
          </span>
        </div>

        {/* Condition */}
        <div className="shrink-0 hidden md:block" style={{ minWidth: "90px" }}>
          <span className="text-[0.84rem]" style={{ fontWeight: 400, color: "#5a5773" }}>{conditionLabel}</span>
        </div>

        {/* Last Check-In */}
        <div className="shrink-0 hidden lg:block" style={{ minWidth: "110px" }}>
          <span className="text-[0.84rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>{lastCheckInText}</span>
        </div>

        {/* Action button — three dots with dropdown menu */}
        <div className="shrink-0 relative" style={{ minWidth: "40px" }}>
          <PatientActions doctorPatientId={doctorPatientId} />
        </div>
      </div>
    </Link>
  );
}

// ─── Three-dot dropdown ───────────────────────────────────

function PatientActions({ doctorPatientId }: { doctorPatientId: string }) {
  return (
    <div className="relative group/actions">
      <button
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[#f0eaff]"
        style={{ border: "1px solid transparent" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const menu = e.currentTarget.nextElementSibling as HTMLElement;
          if (menu) menu.classList.toggle("hidden");
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e9e5f5"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#8e8aa0">
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>
      {/* Dropdown */}
      <div
        className="hidden absolute right-0 top-9 z-20 min-w-[160px] py-1.5 rounded-xl"
        style={{ background: "#f5f2fc", boxShadow: "0 4px 20px rgba(124,58,237,0.1), 0 0 0 1px rgba(124,58,237,0.06)" }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <button
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[0.82rem] transition-colors hover:bg-[#ece7f8] text-left"
          style={{ fontWeight: 500, color: "#2d2b3d" }}
          onClick={() => { window.location.href = `/patients/${doctorPatientId}`; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8e8aa0" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="6" />
            <path d="M7 4v3l2 1.5" />
          </svg>
          View Details
        </button>
        <button
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[0.82rem] transition-colors hover:bg-[#ece7f8] text-left"
          style={{ fontWeight: 500, color: "#2d2b3d" }}
          onClick={() => {
            const url = `${window.location.origin}/p/${doctorPatientId}`;
            navigator.clipboard.writeText(url);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8e8aa0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" />
            <path d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" />
          </svg>
          Copy Link
        </button>
      </div>
    </div>
  );
}

// ─── Click-outside handler (close menus) ──────────────────

if (typeof window !== "undefined") {
  document.addEventListener("click", () => {
    document.querySelectorAll(".group\\/actions > div:last-child").forEach((el) => {
      el.classList.add("hidden");
    });
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
