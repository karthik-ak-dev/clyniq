import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  doctors,
  patients,
  trackingTemplates,
  doctorPatients,
  checkIns,
  reminderConfigs,
} from "./schema";

// Re-export the TemplateQuestion type from schema (single source of truth)
export type { TemplateQuestion } from "./schema";

// ─── Select types (what you GET from DB) ───────────────────
export type Doctor = InferSelectModel<typeof doctors>;
export type Patient = InferSelectModel<typeof patients>;
export type TrackingTemplate = InferSelectModel<typeof trackingTemplates>;
export type DoctorPatient = InferSelectModel<typeof doctorPatients>;
export type CheckIn = InferSelectModel<typeof checkIns>;
export type ReminderConfig = InferSelectModel<typeof reminderConfigs>;

// ─── Insert types (what you INSERT into DB) ────────────────
export type NewDoctor = InferInsertModel<typeof doctors>;
export type NewPatient = InferInsertModel<typeof patients>;
export type NewTrackingTemplate = InferInsertModel<typeof trackingTemplates>;
export type NewDoctorPatient = InferInsertModel<typeof doctorPatients>;
export type NewCheckIn = InferInsertModel<typeof checkIns>;
export type NewReminderConfig = InferInsertModel<typeof reminderConfigs>;

// ─── Enums as const ────────────────────────────────────────
export const CONDITION = {
  DIABETES: "diabetes",
  OBESITY: "obesity",
} as const;
export type Condition = (typeof CONDITION)[keyof typeof CONDITION];

export const QUESTION_TYPE = {
  YES_NO: "yes_no",
  NUMBER: "number",
  TEXT: "text",
  SCALE: "scale",
} as const;
export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

export const TREND = {
  IMPROVING: "improving",
  STABLE: "stable",
  WORSENING: "worsening",
} as const;
export type Trend = (typeof TREND)[keyof typeof TREND];
