import { NextRequest } from "next/server";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { templateQueries } from "@/lib/db/queries";
import { assignTemplateSchema } from "@/lib/validators";

// ─── POST /api/templates/assign ────────────────────────────
// Update which questions are enabled for a specific patient.
// Called when a doctor toggles question switches on the patient form.
//
// Request body:
//   {
//     doctorPatientId: string (UUID),
//     enabledQuestions: string[] (question keys, e.g., ["took_meds", "followed_diet"])
//   }
//
// Validation:
//   1. Zod validates the shape of the request
//   2. templateQueries.updateEnabledQuestions validates that every key
//      actually exists in the assigned template's question definitions
//
// Returns: success confirmation (no data payload needed).
export async function POST(request: NextRequest) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const data = assignTemplateSchema.parse(body);

    await templateQueries.updateEnabledQuestions(
      data.doctorPatientId,
      data.enabledQuestions
    );

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return Response.json(
        { success: false, error: (error as { issues: { message: string }[] }).issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    // Template validation errors (invalid keys, not found)
    if (error instanceof Error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return Response.json(
      { success: false, error: "Failed to update template" },
      { status: 500 }
    );
  }
}
