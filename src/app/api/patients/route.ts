import { NextRequest } from "next/server";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { patientQueries, complianceQueries } from "@/lib/db/queries";
import { createPatientSchema } from "@/lib/validators";
import type { Condition } from "@/lib/db/types";

// ─── POST /api/patients ────────────────────────────────────
// Create a new patient under the authenticated doctor.
//
// Request body:
//   { name: string, phone: string, condition: "diabetes" | "obesity" }
//
// What happens:
//   1. Validates input via Zod
//   2. Creates patient record
//   3. Auto-assigns default template for the condition
//   4. Enables all template questions by default
//   5. Generates magic token for the patient's check-in link
//
// Returns: { patient, doctorPatient } with the magic link token.
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
    const data = createPatientSchema.parse(body);

    const result = await patientQueries.create(
      doctor.id,
      { name: data.name, phone: data.phone },
      data.condition as Condition
    );

    return Response.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    // Zod validation errors have a `issues` property
    if (error instanceof Error && "issues" in error) {
      return Response.json(
        { success: false, error: (error as { issues: { message: string }[] }).issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    return Response.json(
      { success: false, error: "Failed to create patient" },
      { status: 500 }
    );
  }
}

// ─── GET /api/patients ─────────────────────────────────────
// List all patients for the authenticated doctor.
// Each patient includes their latest compliance score and trend.
//
// Used by the dashboard to render patient cards with compliance badges.
//
// Returns: Array of { patient, doctorPatient, compliance }
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

    // Enrich each patient with compliance data
    const data = await Promise.all(
      rows.map(async ({ patient, doctorPatient }) => {
        const compliance = await complianceQueries.getForPatient(doctorPatient);
        return { patient, doctorPatient, compliance };
      })
    );

    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
