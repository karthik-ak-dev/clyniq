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
        className="flex items-center gap-4 px-5 py-4 transition-all group-hover:bg-[#fcfaff]"
        style={{ borderBottom: "1px solid #f5f0ff" }}
      >
        {/* Avatar with ring */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
            border: "2px solid rgba(124,58,237,0.12)",
          }}
        >
          <span className="text-[0.72rem] text-[#7c3aed]" style={{ fontWeight: 600 }}>{initials}</span>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0" style={{ minWidth: "180px" }}>
          <span className="text-[0.88rem] block truncate" style={{ fontWeight: 600, color: "#2d2b3d" }}>{name}</span>
          <p className="text-[0.75rem] mt-0.5" style={{ fontWeight: 400, color: "#8e8aa0" }}>
            {phone} · {conditionLabel}
          </p>
        </div>

        {/* Status */}
        <div className="shrink-0 hidden sm:flex items-center" style={{ minWidth: "110px" }}>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.73rem]"
            style={{ fontWeight: 500, color: status.color, background: status.bg }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: status.color }}
            />
            {status.label}
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

        {/* Action button — proper styled */}
        <div className="shrink-0" style={{ minWidth: "40px" }}>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[#f0eaff]"
            style={{ border: "1px solid transparent" }}
            onClick={(e) => e.preventDefault()}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e9e5f5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#8e8aa0">
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
            </svg>
          </button>
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
