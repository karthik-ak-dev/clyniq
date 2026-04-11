import type { Patient } from "@/lib/db/types";

export function DoctorNotes({ patient }: { patient: Patient }) {
  return (
    <div className="rounded-xl bg-white p-5">
      <h3 className="text-md font-bold text-black">Doctor Notes</h3>

      {patient.notes ? (
        <p className="mt-3 text-md text-black leading-normal whitespace-pre-wrap">{patient.notes}</p>
      ) : (
        <p className="mt-3 text-md text-dark-grey">No notes added.</p>
      )}
    </div>
  );
}
