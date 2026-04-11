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
      className="flex flex-col gap-card-gap rounded-xl bg-white p-card transition-colors hover:bg-primary-subtle"
    >
      {/* Avatar + Heading */}
      <div className="flex flex-col items-center gap-3.5 pr-2 pt-4">
        <div className="flex size-avatar-lg items-center justify-center rounded-full border-[3px] border-primary bg-primary-light">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" fill="#35BFA3"/>
          </svg>
        </div>
        <div className="flex flex-col items-center gap-0.75 w-full">
          <p className="text-center text-md font-normal leading-normal text-dark-grey">
            {formatPatientId(patient.id)}
          </p>
          <p className="text-center text-2xl font-bold leading-tight tracking-tighter text-black">
            {patient.name}
          </p>
        </div>
      </div>

      {/* Info container */}
      <div className="flex flex-col gap-3 rounded-lg bg-surface py-3">
        <div className="flex items-baseline gap-3 px-3 text-md leading-normal">
          <span className="w-22.5 shrink-0 font-normal text-dark-grey">Condition</span>
          <span className="font-medium capitalize text-black">
            {doctorPatient.condition}
          </span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-baseline gap-3 px-3 text-md leading-normal">
          <span className="w-22.5 shrink-0 font-normal text-dark-grey">Last Check-in</span>
          <span className="font-medium text-black">
            {lastCheckIn ? formatDate(lastCheckIn.date) : "—"}
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
    <div className="flex animate-pulse flex-col gap-card-gap rounded-xl bg-white p-card">
      <div className="flex flex-col items-center gap-3.5 pt-4">
        <div className="size-avatar-lg rounded-full border-[3px] border-border bg-surface" />
        <div className="flex flex-col items-center gap-0.75">
          <div className="h-3 w-14 rounded bg-border" />
          <div className="h-5 w-28 rounded bg-border" />
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-lg bg-surface py-3">
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
          <div className="h-6 w-16 rounded-sm bg-border" />
          <div className="h-6 w-10 rounded-sm bg-border" />
        </div>
        <div className="h-6 w-14 rounded-2xl bg-border" />
      </div>
    </div>
  );
}
