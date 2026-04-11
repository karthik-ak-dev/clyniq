import { Suspense } from "react";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { patientQueries, complianceQueries } from "@/lib/db/queries";
import { PatientGrid, PatientGridSkeleton } from "@/components/dashboard/patient-grid";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Patients — DoctorRx",
};

async function PatientListContent() {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) redirect("/login");

  const rows = await patientQueries.findByDoctorId(doctor.id);

  const complianceMap = await complianceQueries.getForPatients(
    rows.map((r) => r.doctorPatient)
  );

  const data = rows.map(({ patient, doctorPatient }) => {
    const result = complianceMap.get(doctorPatient.id);
    return {
      patient,
      doctorPatient,
      compliance: result?.compliance ?? {
        score: { overall: 0, metrics: [] },
        trend: "stable" as const,
        insights: [],
      },
      lastCheckIn: result?.lastCheckIn ?? null,
    };
  });

  return <PatientGrid initialData={data} />;
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<PatientGridSkeleton />}>
      <PatientListContent />
    </Suspense>
  );
}
