import { NextRequest } from "next/server";
import { getTodayUTC } from "@/lib/utils";
import {
  patientQueries,
  templateQueries,
  checkinQueries,
  doctorQueries,
} from "@/lib/db/queries";

// ─── GET /api/p/[token] ────────────────────────────────────
// Fetch the patient context needed to render the check-in page.
// This is a PUBLIC endpoint — the magic token in the URL is the auth.
//
// Returns:
//   - patientName: for the greeting ("Hi Ravi 👋")
//   - doctorName: for context ("Dr. Sharma is tracking your progress")
//   - questions: only the ENABLED questions from the template,
//     filtered and sorted by order — ready to render directly
//   - alreadyCheckedIn: boolean — if true, show "already checked in" state
//
// This single endpoint gives the check-in page everything it needs
// without exposing any internal IDs to the patient.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Look up the doctor_patient by magic token
    const row = await patientQueries.findByMagicToken(token);
    if (!row) {
      return Response.json(
        { success: false, error: "Invalid link" },
        { status: 404 }
      );
    }

    const { patient, doctorPatient } = row;

    // Fetch the doctor's name for the greeting
    const doctor = await doctorQueries.findById(doctorPatient.doctorId);
    if (!doctor) {
      return Response.json(
        { success: false, error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Fetch the template to get full question definitions
    const template = await templateQueries.getById(doctorPatient.templateId);
    if (!template) {
      return Response.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Filter to only enabled questions, sorted by display order
    const enabledSet = new Set(doctorPatient.enabledQuestions);
    const questions = template.questions
      .filter((q) => enabledSet.has(q.key))
      .sort((a, b) => a.order - b.order);

    // Check if the patient has already checked in today
    const today = getTodayUTC();
    const alreadyCheckedIn = await checkinQueries.existsForDate(
      doctorPatient.id,
      today
    );

    return Response.json({
      success: true,
      data: {
        patientName: patient.name.split(" ")[0],
        doctorName: doctor.name,
        questions,
        alreadyCheckedIn,
        token, // Pass back so the check-in form can submit with it
      },
    });
  } catch {
    return Response.json(
      { success: false, error: "Failed to load check-in page" },
      { status: 500 }
    );
  }
}
