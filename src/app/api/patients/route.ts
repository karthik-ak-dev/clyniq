import { NextRequest } from "next/server";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { patientQueries, complianceQueries } from "@/lib/db/queries";
import { createPatientSchema } from "@/lib/validators";
import type { Condition, Gender, BloodType, PatientStatus } from "@/lib/db/types";

// ─── POST /api/patients ────────────────────────────────────
// Create a new patient under the authenticated doctor.
//
// Request body:
//   { name, phone, condition, email?, age?, gender?, status?, notes? }
//
// What happens:
//   1. Validates input via Zod
//   2. Creates patient record (with optional email, age, gender)
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
      {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        dateOfBirth: data.dateOfBirth || null,
        age: data.age ?? null,
        gender: (data.gender as Gender) || null,
        address: data.address || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        bloodType: (data.bloodType as BloodType) || null,
        allergies: data.allergies || null,
        currentMedications: data.currentMedications || null,
        preExistingConditions: data.preExistingConditions || null,
        notes: data.notes || null,
      },
      data.condition as Condition,
      (data.status as PatientStatus) || undefined
    );

    return Response.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodErr = error as { issues: { message: string }[] };
      return Response.json(
        { success: false, error: zodErr.issues[0]?.message ?? "Validation error" },
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

    // Batch fetch compliance + lastCheckIn (2 queries instead of N*3)
    const complianceMap = await complianceQueries.getForPatients(
      rows.map((r) => r.doctorPatient)
    );

    const data = rows.map(({ patient, doctorPatient }) => {
      const result = complianceMap.get(doctorPatient.id);
      return {
        patient,
        doctorPatient,
        compliance: result?.compliance ?? { score: { overall: 0, metrics: [] }, trend: "stable" as const, insights: [] },
        lastCheckIn: result?.lastCheckIn ?? null,
      };
    });

    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
