import { z } from "zod";

// ─── Create Patient Validator ──────────────────────────────
// Used by POST /api/patients when a doctor adds a new patient.
//
// Required: name, phone, condition
// Optional: email, age, gender, status, notes
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
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .optional()
    .or(z.literal("")),
  age: z
    .number()
    .int()
    .min(1, "Age must be at least 1")
    .max(150, "Age must be under 150")
    .optional()
    .nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  status: z.enum(["new", "active", "inactive"]).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
export type CreatePatientInput = z.infer<typeof createPatientSchema>;

