import { redirect, notFound } from "next/navigation";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { patientDetailQueries } from "@/lib/db/queries";
import { PatientDetail } from "@/components/dashboard/patient-detail";

export const metadata = {
  title: "Patient Detail — DoctorRx",
};

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) redirect("/login");

  const { id } = await params;

  const data = await patientDetailQueries.getData(id, doctor.id);
  if (!data) notFound();

  return <PatientDetail {...data} />;
}
