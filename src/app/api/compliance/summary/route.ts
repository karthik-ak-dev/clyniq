import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { patientQueries, complianceQueries } from "@/lib/db/queries";

// ─── GET /api/compliance/summary ───────────────────────────
// Get a compliance overview for ALL patients of the authenticated doctor.
// Returns a lightweight summary per patient (score + trend only, no insights).
//
// Used by the dashboard to render compliance badges on patient cards
// without fetching full detail for each patient.
//
// Returns: Array of { patientId, patientName, condition, overall, trend }
export async function GET() {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const rows = await patientQueries.findByDoctorId(doctor.id);

    // Calculate compliance for each patient in parallel
    const data = await Promise.all(
      rows.map(async ({ patient, doctorPatient }) => {
        const { score, trend } = await complianceQueries.getForPatient(
          doctorPatient
        );

        return {
          doctorPatientId: doctorPatient.id,
          patientName: patient.name,
          condition: doctorPatient.condition,
          overall: score.overall,
          trend,
        };
      })
    );

    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: "Failed to fetch compliance summary" },
      { status: 500 }
    );
  }
}
