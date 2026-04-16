import type { Patient } from "@/lib/db/types";

export function MedicalProfile({ patient }: { patient: Patient }) {
  return (
    <div className="flex min-h-52 flex-1 flex-col rounded-xl bg-white p-5">
      <h3 className="text-2xl font-bold text-black tracking-tighter">Medical Profile</h3>

      <div className="mt-3 flex flex-col gap-2.5 overflow-y-auto min-h-0">
        <InfoRow label="Blood Type" value={patient.bloodType} />
        <InfoRow label="Allergies" value={patient.allergies} />
        <InfoRow label="Medications" value={patient.currentMedications} />
        <InfoRow label="Pre-existing Conditions" value={patient.preExistingConditions} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="text-md">
      <span className="text-dark-grey">{label}</span>
      <p className="mt-0.5 font-medium text-black">{value || "—"}</p>
    </div>
  );
}
