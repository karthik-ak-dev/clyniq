import { z } from "zod";

// ─── Create Patient Validator ──────────────────────────────
// Used by POST /api/patients when a doctor adds a new patient.
//
// Step 1 fields: name, phone, dateOfBirth, gender, email, address, emergency contact
// Step 2 fields: condition, notes, medical profile
// Step 3: review only (no new fields)
export const createPatientSchema = z.object({
  // ── Step 1: Patient Information ──
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be under 255 characters"),
  phone: z
    .string()
    .regex(/^\+91\d{10}$/, "Phone must be in +91XXXXXXXXXX format"),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .optional()
    .or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  emergencyContactName: z.string().max(255).optional().or(z.literal("")),
  emergencyContactPhone: z
    .string()
    .regex(/^\+91\d{10}$/, "Phone must be in +91XXXXXXXXXX format")
    .optional()
    .or(z.literal("")),

  // ── Step 2: Condition & Medical Profile ──
  condition: z.enum(["diabetes", "obesity"], {
    message: "Condition is required (diabetes or obesity)",
  }),
  notes: z.string().max(1000).optional().or(z.literal("")),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional()
    .nullable(),
  allergies: z.string().max(1000).optional().or(z.literal("")),
  currentMedications: z.string().max(1000).optional().or(z.literal("")),
  preExistingConditions: z.string().max(1000).optional().or(z.literal("")),

  // ── Step 3: Settings ──
  status: z.enum(["new", "active", "inactive"]).optional(),

  // Legacy
  age: z
    .number()
    .int()
    .min(1, "Age must be at least 1")
    .max(150, "Age must be under 150")
    .optional()
    .nullable(),
});
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
