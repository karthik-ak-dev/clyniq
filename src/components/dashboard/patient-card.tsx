import Link from "next/link";
import type { Trend } from "@/lib/db/types";
import { TrendIndicator } from "./trend-indicator";

// ─── Patient Card ──────────────────────────────────────────
// Row/card in the patient list. Shows avatar, name, condition,
// compliance %, trend, and last check-in date.
// Matched to design/doc_flow/patients.png.

interface PatientCardProps {
  doctorPatientId: string;
  name: string;
  condition: string;
  complianceOverall: number;
  trend: Trend;
  lastCheckIn: string | null; // ISO date or null
}

export function PatientCard({
  doctorPatientId,
  name,
  condition,
  complianceOverall,
  trend,
  lastCheckIn,
}: PatientCardProps) {
  // Compliance badge color based on percentage
  const complianceBadge =
    complianceOverall >= 70
      ? "badge-compliance-good"
      : complianceOverall >= 40
        ? "badge-compliance-warn"
        : "badge-compliance-bad";

  // Condition badge
  const conditionBadge =
    condition === "diabetes" ? "badge-diabetes" : "badge-obesity";

  // Avatar initials
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Format last check-in
  const lastCheckInText = lastCheckIn
    ? formatRelativeDate(lastCheckIn)
    : "No check-ins yet";

  return (
    <Link href={`/patients/${doctorPatientId}`}>
      <div className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#ede9fe] flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-700 text-[#7c3aed]">{initials}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-600 text-gray-900 truncate">{name}</span>
            <span className={conditionBadge}>
              {condition === "diabetes" ? "Diabetes" : "Obesity"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <TrendIndicator trend={trend} />
            <span className="text-xs text-gray-400">{lastCheckInText}</span>
          </div>
        </div>

        {/* Compliance badge */}
        <span className={complianceBadge}>{complianceOverall}%</span>
      </div>
    </Link>
  );
}

// ─── Helper: relative date ─────────────────────────────────
function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
