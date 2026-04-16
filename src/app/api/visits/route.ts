import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { visitQueries, patientQueries } from "@/lib/db/queries";
import type { VisitType } from "@/lib/db/types";

const createVisitSchema = z.object({
  doctorPatientId: z.string().uuid(),
  visitDate: z.string().min(1, "Visit date is required"),
  visitType: z.enum(["initial", "checkup", "followup", "emergency"]),
  notes: z.string().optional().or(z.literal("")),
  prescription: z.string().optional().or(z.literal("")),
  diagnosis: z.string().optional().or(z.literal("")),
  vitals: z.object({
    bp: z.string().optional(),
    weight: z.number().optional(),
    bloodSugar: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
  nextVisitDate: z.string().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createVisitSchema.parse(body);

    // Verify doctor owns this patient
    const row = await patientQueries.findByDoctorPatientId(data.doctorPatientId, doctor.id);
    if (!row) {
      return Response.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    const visit = await visitQueries.create({
      doctorPatientId: data.doctorPatientId,
      visitDate: data.visitDate,
      visitType: data.visitType as VisitType,
      notes: data.notes || null,
      prescription: data.prescription || null,
      diagnosis: data.diagnosis || null,
      vitals: data.vitals || null,
      nextVisitDate: data.nextVisitDate || null,
    });

    return Response.json({ success: true, data: visit }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, error: error.issues[0]?.message }, { status: 400 });
    }
    return Response.json({ success: false, error: "Failed to create visit" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const dpId = request.nextUrl.searchParams.get("doctorPatientId");
  if (!dpId) {
    return Response.json({ success: false, error: "doctorPatientId is required" }, { status: 400 });
  }

  try {
    const visits = await visitQueries.getByDoctorPatientId(dpId);
    return Response.json({ success: true, data: visits });
  } catch {
    return Response.json({ success: false, error: "Failed to fetch visits" }, { status: 500 });
  }
}
