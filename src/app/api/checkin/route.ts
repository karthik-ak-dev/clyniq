import { NextRequest } from "next/server";
import { z } from "zod";
import { patientQueries, checkinQueries } from "@/lib/db/queries";
import { checkinSchema } from "@/lib/validators";
import { getTodayUTC } from "@/lib/utils";

// ─── POST /api/checkin ─────────────────────────────────────
// Submit a daily check-in for a patient.
// This is a PUBLIC endpoint — no session auth required.
// Authentication is via the magic token embedded in the patient's URL.
//
// Request body:
//   {
//     token: string (64-char magic token from /p/[token]),
//     responses: { "took_meds": true, "followed_diet": false, "blood_sugar": 120, ... }
//   }
//
// Validation steps:
//   1. Zod validates the request shape
//   2. Token lookup confirms a valid doctor_patient exists
//   3. Check that the patient hasn't already checked in today
//   4. Verify response keys match the patient's enabled questions
//   5. Insert the check-in record
//
// The UNIQUE(doctor_patient_id, date) constraint provides a safety net
// at the DB level if the application-level check is somehow bypassed.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkinSchema.parse(body);

    // Step 1: Look up the doctor_patient by magic token
    const row = await patientQueries.findByMagicToken(data.token);
    if (!row) {
      return Response.json(
        { success: false, error: "Invalid check-in link" },
        { status: 404 }
      );
    }

    const { doctorPatient } = row;

    // Step 2: Check if already checked in today
    const today = getTodayUTC();
    const alreadyCheckedIn = await checkinQueries.existsForDate(
      doctorPatient.id,
      today
    );
    if (alreadyCheckedIn) {
      return Response.json(
        { success: false, error: "Already checked in today" },
        { status: 409 } // Conflict
      );
    }

    // Step 3: Validate that response keys match enabled + custom questions
    const responseKeys = Object.keys(data.responses);
    const customKeys = (doctorPatient.customQuestions as { key: string }[] | null)?.map((q) => q.key) ?? [];
    const validKeys = new Set([...doctorPatient.enabledQuestions, ...customKeys]);
    const invalidKeys = responseKeys.filter((k) => !validKeys.has(k));
    if (invalidKeys.length > 0) {
      return Response.json(
        {
          success: false,
          error: `Invalid question keys: ${invalidKeys.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Step 4: Create the check-in (catch UNIQUE constraint from race condition)
    let checkin;
    try {
      checkin = await checkinQueries.create({
        doctorPatientId: doctorPatient.id,
        date: today,
        responses: data.responses,
      });
    } catch (insertErr: unknown) {
      if (insertErr instanceof Error && insertErr.message.includes("unique")) {
        return Response.json(
          { success: false, error: "Already checked in today" },
          { status: 409 }
        );
      }
      throw insertErr;
    }

    return Response.json({ success: true, data: checkin }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    return Response.json(
      { success: false, error: "Failed to submit check-in" },
      { status: 500 }
    );
  }
}
