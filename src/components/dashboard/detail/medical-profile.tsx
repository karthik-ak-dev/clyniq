import type { Patient } from "@/lib/db/types";

export function MedicalProfile({ patient }: { patient: Patient }) {
  return (
    <div className="rounded-xl bg-white p-5">
      <h3 className="text-md font-bold text-black">Medical Profile</h3>

      <div className="mt-3 flex flex-col gap-2.5">
        <InfoRow label="Blood Type" value={patient.bloodType} />
        <InfoRow label="Allergies" value={patient.allergies} />
        <InfoRow label="Medications" value={patient.currentMedications} />
        <InfoRow label="Pre-existing Conditions" value={patient.preExistingConditions} />
      </div>

      {/* Doctor Notes */}
      {patient.notes && (
        <>
          <div className="my-3 border-t border-border" />
          <p className="text-base font-semibold text-dark-grey mb-1.5">Doctor Notes</p>
          <p className="text-md text-black leading-normal whitespace-pre-wrap">{patient.notes}</p>
        </>
      )}
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
