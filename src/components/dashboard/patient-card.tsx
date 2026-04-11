import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { Patient, DoctorPatient, Trend } from "@/lib/db/types";

// ─── Patient Card ─────────────────────────────────────────
// Layout: Avatar → ID → Name → Info container → Badge row

type PatientCardProps = {
  patient: Patient;
  doctorPatient: DoctorPatient;
  compliance: {
    score: { overall: number };
    trend: Trend;
  };
  lastCheckIn: { date: string } | null;
};

function formatPatientId(id: string): string {
  return `PT-${id.slice(-4).toUpperCase()}`;
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return "—";
  const date = new Date(y, m - 1, d);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PatientCard({ patient, doctorPatient, compliance, lastCheckIn }: PatientCardProps) {
  return (
    <Link
      href={`/patients/${patient.id}`}
      className="flex flex-col gap-[19px] rounded-2xl bg-white p-4 transition-colors hover:bg-primary-subtle"
    >
      {/* Avatar + Heading */}
      <div className="flex flex-col items-center gap-3.5 pr-2 pt-4">
        <div className="flex items-center overflow-clip rounded-[40px]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" fill="white"/>
            </svg>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[3px] w-full">
          <p className="text-center text-[12px] font-normal leading-[1.3] text-dark-grey">
            {formatPatientId(patient.id)}
          </p>
          <p className="text-center text-[18px] font-bold leading-[1.2] tracking-[-0.72px] text-black">
            {patient.name}
          </p>
        </div>
      </div>

      {/* Info container */}
      <div className="flex flex-col gap-3 rounded-xl bg-surface py-3">
        <div className="flex items-center gap-1.5 px-2.5 text-[11px] leading-[1.3]">
          <span className="w-[72px] font-normal text-dark-grey">Condition</span>
          <span className="font-medium capitalize text-black">
            {doctorPatient.condition}
          </span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-center gap-1.5 px-2.5 text-[11px] leading-[1.3]">
          <span className="w-[72px] font-normal text-dark-grey">Last Check-in</span>
          <span className="font-medium text-black">
            {lastCheckIn ? formatDate(lastCheckIn.date) : "No check-ins yet"}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge type="condition" value={doctorPatient.condition} />
          <StatusBadge type="compliance" value={compliance.score.overall} />
        </div>
        <StatusBadge type="status" value={doctorPatient.status} />
      </div>
    </Link>
  );
}

// ─── Skeleton Card ────────────────────────────────────────
export function PatientCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4.75 rounded-2xl bg-white p-4">
      <div className="flex flex-col items-center gap-3.5 pt-4">
        <div className="h-20 w-20 rounded-full bg-border" />
        <div className="flex flex-col items-center gap-0.75">
          <div className="h-3 w-14 rounded bg-border" />
          <div className="h-5 w-28 rounded bg-border" />
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-surface py-3">
        <div className="flex justify-between px-2.5">
          <div className="h-3 w-16 rounded bg-border" />
          <div className="h-3 w-20 rounded bg-border" />
        </div>
        <div className="border-t border-border" />
        <div className="flex justify-between px-2.5">
          <div className="h-3 w-20 rounded bg-border" />
          <div className="h-3 w-16 rounded bg-border" />
        </div>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-[6px] bg-border" />
          <div className="h-6 w-10 rounded-[6px] bg-border" />
        </div>
        <div className="h-6 w-14 rounded-[20px] bg-border" />
      </div>
    </div>
  );
}
