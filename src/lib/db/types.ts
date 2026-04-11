import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  doctors,
  patients,
  trackingTemplates,
  doctorPatients,
  checkIns,
  reminderConfigs,
} from "./schema";

// Re-export the TemplateQuestion type from schema (single source of truth).
// Import this from "@/lib/db" everywhere — never redefine the shape.
export type { TemplateQuestion } from "./schema";

// ─── Select types (what you GET from DB) ───────────────────
// Use these when reading/returning data from queries.
// Drizzle infers the exact column types including nullability.
export type Doctor = InferSelectModel<typeof doctors>;
export type Patient = InferSelectModel<typeof patients>;
export type TrackingTemplate = InferSelectModel<typeof trackingTemplates>;
export type DoctorPatient = InferSelectModel<typeof doctorPatients>;
export type CheckIn = InferSelectModel<typeof checkIns>;
export type ReminderConfig = InferSelectModel<typeof reminderConfigs>;

// ─── Insert types (what you INSERT into DB) ────────────────
// Use these when creating new rows. Columns with defaults (id, createdAt)
// become optional, everything else stays required.
export type NewDoctor = InferInsertModel<typeof doctors>;
export type NewPatient = InferInsertModel<typeof patients>;
export type NewTrackingTemplate = InferInsertModel<typeof trackingTemplates>;
export type NewDoctorPatient = InferInsertModel<typeof doctorPatients>;
export type NewCheckIn = InferInsertModel<typeof checkIns>;
export type NewReminderConfig = InferInsertModel<typeof reminderConfigs>;

// ─── Enums as const ────────────────────────────────────────
// Defined as const objects (not TypeScript enums) for better
// tree-shaking and runtime access. Use these instead of string
// literals throughout the codebase for type safety.

// Supported chronic conditions
export const CONDITION = {
  DIABETES: "diabetes",
  OBESITY: "obesity",
} as const;
export type Condition = (typeof CONDITION)[keyof typeof CONDITION];

// Question input types — determines which UI component renders
// and how the compliance engine interprets the response value.
//   yes_no       → boolean (true/false) — counts toward compliance score
//   choice       → string (one of options) — first option = most compliant, counts toward score
//   multi_choice → string[] (multiple of options) — tracked but not scored
//   number       → numeric value — tracked but not scored
//   text         → free-form string — tracked but not scored
//   scale        → integer 1-10 — tracked but not scored
export const QUESTION_TYPE = {
  YES_NO: "yes_no",
  CHOICE: "choice",
  MULTI_CHOICE: "multi_choice",
  NUMBER: "number",
  TEXT: "text",
  SCALE: "scale",
  TIME: "time",
  BP: "bp",
} as const;
export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

// Compliance trend states — computed by comparing the current
// 7-day compliance average against the previous 7-day average.
//   improving → current > previous + 10%
//   worsening → current < previous - 10%
//   stable    → within ±10% threshold
export const TREND = {
  IMPROVING: "improving",
  STABLE: "stable",
  WORSENING: "worsening",
} as const;
export type Trend = (typeof TREND)[keyof typeof TREND];

// Patient gender
export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;
export type Gender = (typeof GENDER)[keyof typeof GENDER];

// Blood type
export const BLOOD_TYPE = {
  "A+": "A+", "A-": "A-",
  "B+": "B+", "B-": "B-",
  "AB+": "AB+", "AB-": "AB-",
  "O+": "O+", "O-": "O-",
} as const;
export type BloodType = (typeof BLOOD_TYPE)[keyof typeof BLOOD_TYPE];

// Doctor-patient relationship status
export const PATIENT_STATUS = {
  NEW: "new",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;
export type PatientStatus = (typeof PATIENT_STATUS)[keyof typeof PATIENT_STATUS];
