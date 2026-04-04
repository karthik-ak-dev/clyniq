import { z } from "zod";

// ─── Check-in Validator ────────────────────────────────────
// Used by POST /api/checkin when a patient submits their daily check-in.
//
// Fields:
//   token     — the 64-char magic token from the URL (/p/[token])
//               used to identify the doctor_patient relationship
//   responses — dynamic key-value object where:
//               - keys match question keys from the template (e.g., "took_meds")
//               - values can be boolean (yes_no), number, or string (text/scale)
//
// The API route further validates that:
//   1. The token maps to a valid doctor_patient record
//   2. Response keys match the enabled questions for that patient
//   3. The patient hasn't already checked in today
export const checkinSchema = z.object({
  token: z
    .string()
    .length(64, "Invalid check-in token"),
  responses: z
    .record(
      z.string(),
      z.union([z.boolean(), z.number(), z.string()])
    )
    .refine(
      (obj) => Object.keys(obj).length > 0,
      "At least one response is required"
    ),
});
export type CheckinInput = z.infer<typeof checkinSchema>;
