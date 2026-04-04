import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  time,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ─────────────────────────────────────────────────
export const conditionEnum = pgEnum("condition", ["diabetes", "obesity"]);

// ─── Template Question Shape ──────────────────────────────
// Used as the JSONB type for trackingTemplates.questions
export type TemplateQuestion = {
  key: string;
  label: string;
  type: "yes_no" | "number" | "text" | "scale";
  unit?: string;
  order: number;
};

// ─── Doctors ───────────────────────────────────────────────
export const doctors = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Patients ──────────────────────────────────────────────
export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Tracking Templates ───────────────────────────────────
// Default question sets per condition. Each template has a JSONB
// array of question definitions that drive the check-in form.
export const trackingTemplates = pgTable("tracking_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  condition: conditionEnum("condition").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  questions: jsonb("questions").$type<TemplateQuestion[]>().notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Doctor–Patient Link ──────────────────────────────────
// Join table: a doctor's relationship to a patient, including
// which template is assigned and which questions are enabled.
export const doctorPatients = pgTable(
  "doctor_patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorId: uuid("doctor_id")
      .references(() => doctors.id)
      .notNull(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    condition: conditionEnum("condition").notNull(),
    templateId: uuid("template_id")
      .references(() => trackingTemplates.id)
      .notNull(),
    enabledQuestions: jsonb("enabled_questions")
      .$type<string[]>()
      .notNull(),
    magicToken: varchar("magic_token", { length: 64 }).unique().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("doctor_patients_doctor_patient_idx").on(
      table.doctorId,
      table.patientId
    ),
  ]
);

// ─── Check-ins ─────────────────────────────────────────────
// Daily patient responses. `responses` is a JSONB object keyed
// by question keys from the template (e.g., { took_meds: true }).
export const checkIns = pgTable(
  "check_ins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorPatientId: uuid("doctor_patient_id")
      .references(() => doctorPatients.id)
      .notNull(),
    date: date("date").notNull(),
    responses: jsonb("responses")
      .$type<Record<string, boolean | number | string>>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("check_ins_doctor_patient_date_idx").on(
      table.doctorPatientId,
      table.date
    ),
  ]
);

// ─── Reminder Configs ──────────────────────────────────────
export const reminderConfigs = pgTable("reminder_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorPatientId: uuid("doctor_patient_id")
    .references(() => doctorPatients.id)
    .notNull(),
  reminderTime: time("reminder_time").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  lastSentAt: timestamp("last_sent_at"),
});
