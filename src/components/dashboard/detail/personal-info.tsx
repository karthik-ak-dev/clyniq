import type { Patient } from "@/lib/db/types";
import { calculateAge, formatDOB } from "@/lib/utils/format-helpers";

export function PersonalInfo({ patient }: { patient: Patient }) {
  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : patient.age;
  const dobDisplay = patient.dateOfBirth
    ? `${formatDOB(patient.dateOfBirth)}${age !== null ? ` (${age} yrs)` : ""}`
    : null;

  return (
    <div className="rounded-xl bg-white p-5">
      <h3 className="text-2xl font-bold text-black tracking-tighter">Personal Info</h3>

      <div className="mt-3 flex flex-col gap-2.5">
        <InfoRow label="Gender" value={patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : null} />
        <InfoRow label="Date of Birth" value={dobDisplay} />
        <InfoRow label="Phone" value={patient.phone} />
        <InfoRow label="Email" value={patient.email} />
        <InfoRow label="Address" value={patient.address} />
      </div>

      {/* Emergency Contact */}
      {(patient.emergencyContactName || patient.emergencyContactPhone) && (
        <>
          <div className="my-3 border-t border-border" />
          <p className="text-md font-bold text-dark-grey mb-2">Emergency Contact</p>
          <div className="flex flex-col gap-2">
            <InfoRow label="Name" value={patient.emergencyContactName} />
            <InfoRow label="Phone" value={patient.emergencyContactPhone} />
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-baseline gap-2 text-md">
      <span className="w-22 shrink-0 text-dark-grey">{label}</span>
      <span className="font-medium text-black wrap-break-word">{value || "—"}</span>
    </div>
  );
}
