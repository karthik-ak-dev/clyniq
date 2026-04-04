import { eq, and, or, ilike } from "drizzle-orm";
import crypto from "crypto";
import { db } from "@/lib/db";
import { patients, doctorPatients, trackingTemplates } from "@/lib/db/schema";
import type {
  Patient,
  NewPatient,
  DoctorPatient,
  Condition,
} from "@/lib/db/types";

// ─── Patient Queries ───────────────────────────────────────
// All database operations for patients and the doctor_patients link.
// Patients are always accessed through a doctor's context — there's
// no global patient lookup (a patient can exist under multiple doctors).

export const patientQueries = {
  // Create a new patient AND the doctor_patient link in one operation.
  // Steps:
  //   1. Insert into patients table
  //   2. Look up the default template for the given condition
  //   3. Enable all template questions by default
  //   4. Generate a 64-char magic token for the patient's check-in link
  //   5. Insert into doctor_patients with all the above
  //
  // Returns both the patient and doctor_patient records.
  async create(
    doctorId: string,
    data: Pick<NewPatient, "name" | "phone">,
    condition: Condition
  ): Promise<{ patient: Patient; doctorPatient: DoctorPatient }> {
    // Step 1: Create the patient record
    const [patient] = await db
      .insert(patients)
      .values({ name: data.name, phone: data.phone })
      .returning();

    // Step 2: Find the default template for this condition
    const [template] = await db
      .select()
      .from(trackingTemplates)
      .where(
        and(
          eq(trackingTemplates.condition, condition),
          eq(trackingTemplates.isDefault, true)
        )
      )
      .limit(1);

    if (!template) {
      throw new Error(`No default template found for condition: ${condition}`);
    }

    // Step 3: Enable all questions from the template by default
    const enabledQuestions = template.questions.map((q) => q.key);

    // Step 4: Generate a unique magic token (64 hex chars = 32 bytes)
    const magicToken = crypto.randomBytes(32).toString("hex");

    // Step 5: Create the doctor-patient link
    const [doctorPatient] = await db
      .insert(doctorPatients)
      .values({
        doctorId,
        patientId: patient.id,
        condition,
        templateId: template.id,
        enabledQuestions,
        magicToken,
      })
      .returning();

    return { patient, doctorPatient };
  },

  // List all patients for a given doctor.
  // Returns the doctor_patient link joined with patient data.
  // Used by GET /api/patients (dashboard patient list).
  async findByDoctorId(
    doctorId: string
  ): Promise<{ patient: Patient; doctorPatient: DoctorPatient }[]> {
    const rows = await db
      .select({
        patient: patients,
        doctorPatient: doctorPatients,
      })
      .from(doctorPatients)
      .innerJoin(patients, eq(patients.id, doctorPatients.patientId))
      .where(eq(doctorPatients.doctorId, doctorId));

    return rows;
  },

  // Get a single patient by the doctor_patient ID.
  // Includes patient data + template questions for the detail page.
  // Returns null if not found or doesn't belong to the doctor.
  async findByDoctorPatientId(
    doctorPatientId: string,
    doctorId: string
  ): Promise<{
    patient: Patient;
    doctorPatient: DoctorPatient;
  } | null> {
    const [row] = await db
      .select({
        patient: patients,
        doctorPatient: doctorPatients,
      })
      .from(doctorPatients)
      .innerJoin(patients, eq(patients.id, doctorPatients.patientId))
      .where(
        and(
          eq(doctorPatients.id, doctorPatientId),
          eq(doctorPatients.doctorId, doctorId)
        )
      )
      .limit(1);

    return row ?? null;
  },

  // Find a doctor_patient record by magic token.
  // Used by the patient check-in page (/p/[token]) and POST /api/checkin.
  // Joins patient + doctor_patient + template so the check-in form
  // has everything it needs in one query.
  async findByMagicToken(token: string): Promise<{
    patient: Patient;
    doctorPatient: DoctorPatient;
  } | null> {
    const [row] = await db
      .select({
        patient: patients,
        doctorPatient: doctorPatients,
      })
      .from(doctorPatients)
      .innerJoin(patients, eq(patients.id, doctorPatients.patientId))
      .where(eq(doctorPatients.magicToken, token))
      .limit(1);

    return row ?? null;
  },

  // Search patients by name or phone for a given doctor.
  // Case-insensitive partial match on both fields.
  // Used by GET /api/patients/search?q=query.
  async search(
    doctorId: string,
    query: string
  ): Promise<{ patient: Patient; doctorPatient: DoctorPatient }[]> {
    const pattern = `%${query}%`;

    const rows = await db
      .select({
        patient: patients,
        doctorPatient: doctorPatients,
      })
      .from(doctorPatients)
      .innerJoin(patients, eq(patients.id, doctorPatients.patientId))
      .where(
        and(
          eq(doctorPatients.doctorId, doctorId),
          or(ilike(patients.name, pattern), ilike(patients.phone, pattern))
        )
      );

    return rows;
  },
};
