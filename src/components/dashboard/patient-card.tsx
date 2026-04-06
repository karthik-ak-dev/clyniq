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
          className="absolute left-0 top-2 bottom-2 w-0.75 rounded-r-full bg-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* Arrow indicator */}
        <div className="shrink-0" style={{ minWidth: "24px" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#b0aac2" strokeWidth="1.5" strokeLinecap="round" className="group-hover:stroke-[#7c3aed] transition-colors">
            <path d="M5 3l4 4-4 4" />
          </svg>
        </div>
      </div>
    </Link>
  );
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
