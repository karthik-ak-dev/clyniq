import { z } from "zod";

// ─── Create Patient Validator ──────────────────────────────
// Used by POST /api/patients when a doctor adds a new patient.
//
// Fields:
//   name      — patient's full name, 1-255 chars
//   phone     — Indian phone number in +91XXXXXXXXXX format (13 chars total)
//   condition — must be "diabetes" or "obesity" (drives template assignment)
//
// The API route uses this to validate the request body before
// creating the patient record and doctor_patient link.
export const createPatientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be under 255 characters"),
  phone: z
    .string()
    .regex(/^\+91\d{10}$/, "Phone must be in +91XXXXXXXXXX format"),
  condition: z.enum(["diabetes", "obesity"], {
    message: "Condition is required (diabetes or obesity)",
  }),
});
export type CreatePatientInput = z.infer<typeof createPatientSchema>;

// ─── Assign Template Validator ─────────────────────────────
// Used by POST /api/templates/assign when a doctor configures
// which questions a patient should see.
//
// Fields:
//   doctorPatientId  — the doctor_patients row to update
//   enabledQuestions  — array of question keys the doctor wants active
//                       (must be non-empty; at least one question required)
//
// The API route verifies that each key in enabledQuestions actually
// exists in the assigned template's questions array.
export const assignTemplateSchema = z.object({
  doctorPatientId: z.string().uuid("Invalid doctor-patient ID"),
  enabledQuestions: z
    .array(z.string())
    .min(1, "At least one question must be enabled"),
});
export type AssignTemplateInput = z.infer<typeof assignTemplateSchema>;
