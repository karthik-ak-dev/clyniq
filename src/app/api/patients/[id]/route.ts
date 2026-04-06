import { NextRequest } from "next/server";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import {
  patientQueries,
  complianceQueries,
  checkinQueries,
  templateQueries,
} from "@/lib/db/queries";

// ─── GET /api/patients/[id] ────────────────────────────────
// Get full detail for a single patient (by doctor_patient ID).
// This is the data source for the Patient Detail page — the most
// important screen in the app.
//
// Returns:
//   - patient: name, phone, createdAt
//   - doctorPatient: condition, enabledQuestions, magicToken
//   - template: full question definitions (for rendering labels/types)
//   - compliance: overall score, per-question metrics, trend, insights
//   - recentCheckIns: last 7 days of check-in records (for activity timeline)
//
// The [id] param is the doctor_patients.id (not patients.id),
// because a patient could theoretically exist under multiple doctors.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Fetch patient + doctor_patient link (validates doctor ownership)
    const row = await patientQueries.findByDoctorPatientId(id, doctor.id);
    if (!row) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    const { patient, doctorPatient } = row;

    // Fetch template for question definitions (labels, types, units)
    const template = await templateQueries.getById(doctorPatient.templateId);
    if (!template) {
      return Response.json(
        { success: false, error: "Template not found for this patient" },
        { status: 404 }
      );
    }

    // Calculate compliance (score, trend, insights)
    const compliance = await complianceQueries.getForPatient(doctorPatient);

    // Fetch last 7 days of check-ins for the activity timeline
    const recentCheckIns = await checkinQueries.getLastNDays(
      doctorPatient.id,
      7
    );

    return Response.json({
      success: true,
      data: {
        patient,
        doctorPatient,
        template,
        compliance,
        recentCheckIns,
      },
    });
  } catch {
    return Response.json(
      { success: false, error: "Failed to fetch patient detail" },
      { status: 500 }
    );
  }
}
