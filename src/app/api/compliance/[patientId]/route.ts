import { NextRequest } from "next/server";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { patientQueries, complianceQueries } from "@/lib/db/queries";

// ─── GET /api/compliance/[patientId] ───────────────────────
// Get full compliance data for a single patient.
// The [patientId] param is the doctor_patients.id (not patients.id).
//
// Returns:
//   - score: { overall: number, metrics: QuestionMetric[] }
//     overall is 0-100%, metrics has per-question done/total/percentage
//   - trend: "improving" | "stable" | "worsening"
//   - insights: string[] (e.g., ["Missed meds 3 times this week"])
//
// This endpoint is used by the Patient Detail page's compliance section.
// For the dashboard overview (all patients), use GET /api/compliance/summary.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { patientId } = await params;

    // Verify this patient belongs to the authenticated doctor
    const row = await patientQueries.findByDoctorPatientId(
      patientId,
      doctor.id
    );
    if (!row) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    const compliance = await complianceQueries.getForPatient(row.doctorPatient);
    return Response.json({ success: true, data: compliance });
  } catch {
    return Response.json(
      { success: false, error: "Failed to fetch compliance data" },
      { status: 500 }
    );
  }
}
