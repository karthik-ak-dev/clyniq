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

    // Fetch doctor, template, and today's check-in status in parallel
    const today = getTodayUTC();
    const [doctor, template, alreadyCheckedIn] = await Promise.all([
      doctorQueries.findById(doctorPatient.doctorId),
      templateQueries.getById(doctorPatient.templateId),
      checkinQueries.existsForDate(doctorPatient.id, today),
    ]);

    if (!doctor) {
      return Response.json(
        { success: false, error: "Doctor not found" },
        { status: 404 }
      );
    }

    if (!template) {
      return Response.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Filter to only enabled questions, merge custom questions, sort by order
    const enabledSet = new Set(doctorPatient.enabledQuestions);
    const defaultQuestions = template.questions
      .filter((q) => enabledSet.has(q.key));
    const custom = (doctorPatient.customQuestions as typeof template.questions) || [];
    const questions = [...defaultQuestions, ...custom]
      .sort((a, b) => a.order - b.order);

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
