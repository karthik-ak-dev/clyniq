import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { db } from "@/lib/db";
import { patients, doctorPatients, trackingTemplates } from "@/lib/db/schema";
import type { TemplateQuestion } from "@/lib/db/schema";
import type {
  Patient,
  DoctorPatient,
  Condition,
  Gender,
  BloodType,
  PatientStatus,
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
    data: {
      name: string;
      phone: string;
      email?: string | null;
      dateOfBirth?: string | null;
      age?: number | null;
      gender?: Gender | null;
      address?: string | null;
      emergencyContactName?: string | null;
      emergencyContactPhone?: string | null;
      bloodType?: BloodType | null;
      allergies?: string | null;
      currentMedications?: string | null;
      preExistingConditions?: string | null;
      notes?: string | null;
    },
    condition: Condition,
    status?: PatientStatus,
    enabledQuestionsOverride?: string[],
    customQuestions?: TemplateQuestion[],
  ): Promise<{ patient: Patient; doctorPatient: DoctorPatient }> {
    // Step 1: Create the patient record
    const [patient] = await db
      .insert(patients)
      .values({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        dateOfBirth: data.dateOfBirth || null,
        age: data.age || null,
        gender: data.gender || null,
        address: data.address || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        bloodType: data.bloodType || null,
        allergies: data.allergies || null,
        currentMedications: data.currentMedications || null,
        preExistingConditions: data.preExistingConditions || null,
        notes: data.notes || null,
      })
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

    // Step 3: Use provided enabled questions, or enable all by default
    const enabledQuestions = enabledQuestionsOverride ?? template.questions.map((q) => q.key);

    // Step 4+5: Generate magic token and create doctor-patient link
    // Retry on token collision (extremely rare with 256-bit entropy)
    let doctorPatient;
    for (let attempt = 0; attempt < 3; attempt++) {
      const magicToken = crypto.randomBytes(32).toString("hex");
      try {
        const [row] = await db
          .insert(doctorPatients)
          .values({
            doctorId,
            patientId: patient.id,
            condition,
            templateId: template.id,
            enabledQuestions,
            customQuestions: customQuestions || [],
            magicToken,
            status: status || "new",
          })
          .returning();
        doctorPatient = row;
        break;
      } catch (err: unknown) {
        const isUniqueViolation = err instanceof Error && err.message.includes("unique");
        if (!isUniqueViolation || attempt === 2) throw err;
      }
    }

    return { patient, doctorPatient: doctorPatient! };
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
};
