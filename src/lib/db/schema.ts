import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  time,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ─────────────────────────────────────────────────
// Supported chronic conditions. New conditions can be added here
// and will propagate to templates + doctor_patients automatically.
export const conditionEnum = pgEnum("condition", ["diabetes", "obesity"]);

// Patient gender options
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// Doctor-patient relationship status
export const patientStatusEnum = pgEnum("patient_status", ["new", "active", "inactive"]);

// ─── Template Question Shape ──────────────────────────────
// Defines the structure of each question inside a tracking template's
// JSONB `questions` array. This type is the single source of truth —
// used by schema, seed, compliance engine, and check-in renderer.
//
// Fields:
//   key     — unique identifier within a template (e.g., "took_meds")
//   label   — human-readable question text shown to the patient
//   type    — determines the input component and how the response is stored:
//             yes_no       → boolean (true/false toggle buttons)
//             number       → numeric input with optional unit label
//             text         → free-form text input
//             scale        → 1-10 slider/rating
//             choice       → pick ONE from options (e.g., "How was your diet?" → Perfect/Good/Okay/Poor)
//             multi_choice → pick MULTIPLE from options (e.g., "Any symptoms?" → checkboxes)
//   unit    — optional display suffix for number types (e.g., "mg/dL", "kg", "steps")
//   options — required for choice/multi_choice types, array of option labels
//   order   — display order in the check-in form (ascending)
//
// Compliance scoring:
//   yes_no       → true counts as compliant
//   choice       → first option counts as most compliant (e.g., "Perfect" > "Poor")
//   multi_choice → not scored (tracked only)
//   number/text/scale → not scored (tracked only)
export type TemplateQuestion = {
  key: string;
  label: string;
  type: "yes_no" | "number" | "text" | "scale" | "choice" | "multi_choice" | "time" | "bp";
  unit?: string;
  options?: string[];
  order: number;
};

// ─── Doctors ───────────────────────────────────────────────
// Authenticated users of the platform. Each doctor has their own
// set of patients and views compliance dashboards.
//
// Auth: email/password via NextAuth credentials provider.
// passwordHash is bcrypt-hashed, never stored or returned in plain text.
export const doctors = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),               // PK, auto-generated UUID v4
  name: varchar("name", { length: 255 }).notNull(),           // Doctor's display name
  email: varchar("email", { length: 255 }).unique().notNull(),// Login email, must be unique
  passwordHash: text("password_hash").notNull(),               // bcrypt hash of password
  createdAt: timestamp("created_at").defaultNow().notNull(),   // Row creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().notNull(),   // Last profile update timestamp
});

// ─── Patients ──────────────────────────────────────────────
// Patients are created by doctors. A patient has no login — they
// interact solely through magic links. The same phone number can
// exist for patients under different doctors (no global unique).
// Blood type options
export const bloodTypeEnum = pgEnum("blood_type", [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
]);

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),               // PK, auto-generated UUID v4
  name: varchar("name", { length: 255 }).notNull(),           // Patient's full name
  phone: varchar("phone", { length: 15 }).notNull(),          // Phone in +91XXXXXXXXXX format
  email: varchar("email", { length: 255 }),                    // Optional email address
  dateOfBirth: date("date_of_birth"),                          // Optional DOB (YYYY-MM-DD)
  age: integer("age"),                                         // Optional age (legacy, derive from DOB)
  gender: genderEnum("gender"),                                // Optional: male, female, other
  address: text("address"),                                    // Optional address
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }), // Emergency contact
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 15 }), // Emergency contact phone
  bloodType: bloodTypeEnum("blood_type"),                      // Optional blood type
  allergies: text("allergies"),                                 // Optional known allergies
  currentMedications: text("current_medications"),              // Optional current medications
  preExistingConditions: text("pre_existing_conditions"),       // Optional other conditions
  notes: text("notes"),                                        // Optional doctor notes about patient
  createdAt: timestamp("created_at").defaultNow().notNull(),   // Row creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().notNull(),   // Last update timestamp
});

// ─── Tracking Templates ───────────────────────────────────
// Predefined question sets per condition. In MVP, only system-default
// templates exist (one per condition, seeded on first deploy).
// Future: doctors can create custom templates.
//
// The `questions` JSONB column holds an array of TemplateQuestion objects.
// This drives the entire check-in form — what the patient sees is
// determined by this array filtered through doctor_patients.enabled_questions.
export const trackingTemplates = pgTable(
  "tracking_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),               // PK, auto-generated UUID v4
    condition: conditionEnum("condition").notNull(),             // Which condition this template is for
    name: varchar("name", { length: 255 }).notNull(),           // Human-readable template name
    questions: jsonb("questions").$type<TemplateQuestion[]>()   // Array of question definitions
      .notNull(),
    isDefault: boolean("is_default").default(false).notNull(),  // true = system default, auto-assigned
    createdAt: timestamp("created_at").defaultNow().notNull(),   // Row creation timestamp
    updatedAt: timestamp("updated_at").defaultNow().notNull(),   // Last update timestamp
  },
);

// ─── Doctor–Patient Link ──────────────────────────────────
// The central join table connecting a doctor to a patient. Each row
// represents one doctor treating one patient for a specific condition.
//
// Key fields:
//   templateId        — which tracking template is assigned
//   enabledQuestions   — subset of template question keys the doctor has
//                        toggled ON for this patient (JSONB string array)
//   magicToken         — 64-char random hex string used in the patient's
//                        magic link URL (/p/[token]). Generated once on
//                        patient creation via crypto.randomBytes(32).toString('hex')
//
// Constraints:
//   - UNIQUE(doctorId, patientId) — a doctor can only link to a patient once
//   - UNIQUE(magicToken) — each magic link is globally unique
export const doctorPatients = pgTable(
  "doctor_patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),             // PK, auto-generated UUID v4
    doctorId: uuid("doctor_id")                               // FK → doctors.id
      .references(() => doctors.id)
      .notNull(),
    patientId: uuid("patient_id")                             // FK → patients.id
      .references(() => patients.id)
      .notNull(),
    condition: conditionEnum("condition").notNull(),           // The condition being tracked
    templateId: uuid("template_id")                           // FK → tracking_templates.id
      .references(() => trackingTemplates.id)
      .notNull(),
    enabledQuestions: jsonb("enabled_questions")               // Question keys toggled ON by doctor
      .$type<string[]>()                                      // e.g., ["took_meds", "followed_diet"]
      .notNull(),
    customQuestions: jsonb("custom_questions")                 // Doctor-added custom questions for this patient
      .$type<TemplateQuestion[]>()
      .default([])
      .notNull(),
    magicToken: varchar("magic_token", { length: 64 })        // Unique token for patient's magic link
      .unique()
      .notNull(),
    status: patientStatusEnum("status").default("new").notNull(), // Relationship status: new, active, inactive
    createdAt: timestamp("created_at").defaultNow().notNull(), // Row creation timestamp
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Last update timestamp
  },
  (table) => [
    uniqueIndex("doctor_patients_doctor_patient_idx").on(table.doctorId, table.patientId),
    index("doctor_patients_doctor_id_idx").on(table.doctorId),
    index("doctor_patients_magic_token_idx").on(table.magicToken),
  ]
);

// ─── Check-ins ─────────────────────────────────────────────
// One row per patient per day. The `responses` JSONB column stores
// key-value pairs matching the question keys from the template.
//
// Example responses for a diabetes patient:
//   {
//     "took_meds": true,
//     "followed_diet": "Good",
//     "blood_sugar": 120,
//     "weight": 72.5,
//     "symptoms": ["Fatigue", "Dizziness"]
//   }
//
// Value types by question type:
//   yes_no       → boolean
//   choice       → string (one of the options)
//   multi_choice → string[] (array of selected options)
//   number       → number
//   text         → string
//   scale        → number (1-10)
//
// Constraint: UNIQUE(doctorPatientId, date) prevents double check-ins.
export const checkIns = pgTable(
  "check_ins",
  {
    id: uuid("id").defaultRandom().primaryKey(),             // PK, auto-generated UUID v4
    doctorPatientId: uuid("doctor_patient_id")                // FK → doctor_patients.id
      .references(() => doctorPatients.id)
      .notNull(),
    date: date("date").notNull(),                             // The calendar date of check-in (YYYY-MM-DD)
    responses: jsonb("responses")                             // Dynamic key-value responses from patient
      .$type<Record<string, boolean | number | string | string[]>>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(), // Row creation timestamp
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Last update timestamp
  },
  (table) => [
    uniqueIndex("check_ins_doctor_patient_date_idx").on(table.doctorPatientId, table.date),
    index("check_ins_doctor_patient_id_idx").on(table.doctorPatientId),
  ]
);

// ─── Visit Types ──────────────────────────────────────────
export const visitTypeEnum = pgEnum("visit_type", [
  "initial",
  "checkup",
  "followup",
  "emergency",
]);

// ─── Visits ───────────────────────────────────────────────
// Doctor records of in-person patient visits. Each visit captures
// notes, prescriptions, vitals, and diagnosis from the consultation.
export const visits = pgTable(
  "visits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorPatientId: uuid("doctor_patient_id")
      .references(() => doctorPatients.id)
      .notNull(),
    visitDate: date("visit_date").notNull(),
    visitType: visitTypeEnum("visit_type").notNull(),
    notes: text("notes"),
    prescription: text("prescription"),
    diagnosis: text("diagnosis"),
    vitals: jsonb("vitals").$type<{
      bp?: string;
      weight?: number;
      bloodSugar?: number;
      temperature?: number;
    }>(),
    nextVisitDate: date("next_visit_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("visits_doctor_patient_id_idx").on(table.doctorPatientId),
  ]
);

// ─── Reminder Configs ──────────────────────────────────────
// Per-patient WhatsApp reminder settings. Feature-flagged via
// WHATSAPP_ENABLED env var. The cron job (/api/reminders/send)
// queries for enabled reminders whose reminderTime falls within
// the current hour window, then sends via Twilio.
export const reminderConfigs = pgTable(
  "reminder_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorPatientId: uuid("doctor_patient_id")
      .references(() => doctorPatients.id)
      .notNull(),
    reminderTime: time("reminder_time").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    lastSentAt: timestamp("last_sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(), // Row creation timestamp
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Last update timestamp
  },
  (table) => [
    index("reminder_configs_doctor_patient_id_idx").on(table.doctorPatientId),
  ]
);
