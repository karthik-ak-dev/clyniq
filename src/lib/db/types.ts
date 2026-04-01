import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  doctors,
  doctorSchedules,
  subscriptions,
  patients,
  appointments,
  questionnaires,
  visits,
  prescriptions,
  documents,
} from "./schema";

// ─── Select types (what you GET from DB) ───────────────────
export type Doctor = InferSelectModel<typeof doctors>;
export type DoctorSchedule = InferSelectModel<typeof doctorSchedules>;
export type Subscription = InferSelectModel<typeof subscriptions>;
export type Patient = InferSelectModel<typeof patients>;
export type Appointment = InferSelectModel<typeof appointments>;
export type Questionnaire = InferSelectModel<typeof questionnaires>;
export type Visit = InferSelectModel<typeof visits>;
export type Prescription = InferSelectModel<typeof prescriptions>;
export type Document = InferSelectModel<typeof documents>;

// ─── Insert types (what you INSERT into DB) ────────────────
export type NewDoctor = InferInsertModel<typeof doctors>;
export type NewDoctorSchedule = InferInsertModel<typeof doctorSchedules>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;
export type NewPatient = InferInsertModel<typeof patients>;
export type NewAppointment = InferInsertModel<typeof appointments>;
export type NewQuestionnaire = InferInsertModel<typeof questionnaires>;
export type NewVisit = InferInsertModel<typeof visits>;
export type NewPrescription = InferInsertModel<typeof prescriptions>;
export type NewDocument = InferInsertModel<typeof documents>;

// ─── Enums as const (strict values for status fields) ──────
export const APPOINTMENT_STATUS = {
  BOOKED: "booked",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;
export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const SUBSCRIPTION_STATUS = {
  TRIAL: "trial",
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;
export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;
export type Gender = (typeof GENDER)[keyof typeof GENDER];

export const QUESTIONNAIRE_DURATION = {
  TODAY: "today",
  FEW_DAYS: "few_days",
  A_WEEK: "a_week",
  MORE_THAN_WEEK: "more_than_week",
  ONGOING: "ongoing",
} as const;
export type QuestionnaireDuration =
  (typeof QUESTIONNAIRE_DURATION)[keyof typeof QUESTIONNAIRE_DURATION];

export const SLOT_DURATION = [15, 20, 30] as const;
export type SlotDuration = (typeof SLOT_DURATION)[number];

export const DAY_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const;
export type DayOfWeek = (typeof DAY_OF_WEEK)[number];

export const DOCUMENT_TYPE = {
  REPORT: "report",
  SCAN: "scan",
  OTHER: "other",
} as const;
export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export const FREQUENCY = {
  OD: "OD",
  BD: "BD",
  TID: "TID",
  QID: "QID",
  SOS: "SOS",
} as const;
export type Frequency = (typeof FREQUENCY)[keyof typeof FREQUENCY];
