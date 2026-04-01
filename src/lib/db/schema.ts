import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  time,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Doctors ───────────────────────────────────────────────
export const doctors = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 15 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  photoUrl: text("photo_url"),
  specialization: varchar("specialization", { length: 255 }),
  qualifications: varchar("qualifications", { length: 500 }),
  experienceYears: integer("experience_years"),
  clinicName: varchar("clinic_name", { length: 255 }),
  clinicAddress: text("clinic_address"),
  clinicPhone: varchar("clinic_phone", { length: 15 }),
  consultationFee: integer("consultation_fee"), // in paise
  depositAmount: integer("deposit_amount"), // in paise
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Doctor Schedules ──────────────────────────────────────
export const doctorSchedules = pgTable("doctor_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorId: uuid("doctor_id")
    .references(() => doctors.id)
    .notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sun ... 6=Sat
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  slotDurationMins: integer("slot_duration_mins").notNull(), // 15, 20, or 30
  isActive: boolean("is_active").default(true).notNull(),
});

// ─── Subscriptions ─────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorId: uuid("doctor_id")
    .references(() => doctors.id)
    .notNull(),
  status: varchar("status", { length: 20 }).notNull(), // trial, active, expired, cancelled
  trialEndsAt: timestamp("trial_ends_at"),
  razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Patients ──────────────────────────────────────────────
export const patients = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorId: uuid("doctor_id")
      .references(() => doctors.id)
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 15 }).notNull(),
    age: integer("age"),
    gender: varchar("gender", { length: 10 }),
    bloodGroup: varchar("blood_group", { length: 5 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("patients_doctor_phone_idx").on(table.doctorId, table.phone),
  ]
);

// ─── Appointments ──────────────────────────────────────────
export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorId: uuid("doctor_id")
      .references(() => doctors.id)
      .notNull(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    date: date("date").notNull(),
    time: time("time").notNull(),
    status: varchar("status", { length: 20 }).notNull(), // booked, completed, cancelled, no_show
    depositAmount: integer("deposit_amount"), // in paise
    depositPaid: boolean("deposit_paid").default(false).notNull(),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("appointments_doctor_date_time_idx").on(
      table.doctorId,
      table.date,
      table.time
    ),
  ]
);

// ─── Questionnaires ────────────────────────────────────────
export const questionnaires = pgTable("questionnaires", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id)
    .notNull(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  chiefComplaint: text("chief_complaint"),
  duration: varchar("duration", { length: 50 }),
  severity: integer("severity"),
  existingConditions: text("existing_conditions"), // JSON string array
  currentMedications: text("current_medications"),
  allergies: text("allergies"),
  previousSurgeries: text("previous_surgeries"),
  additionalNotes: text("additional_notes"),
  aiSummary: text("ai_summary"),
  filledAt: timestamp("filled_at").defaultNow(),
});

// ─── Visits ────────────────────────────────────────────────
export const visits = pgTable("visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorId: uuid("doctor_id")
    .references(() => doctors.id)
    .notNull(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  date: date("date").notNull(),
  chiefComplaint: text("chief_complaint"),
  diagnosis: text("diagnosis"),
  vitalsBp: varchar("vitals_bp", { length: 20 }),
  vitalsTemp: varchar("vitals_temp", { length: 10 }),
  vitalsWeight: varchar("vitals_weight", { length: 10 }),
  vitalsPulse: varchar("vitals_pulse", { length: 10 }),
  investigations: text("investigations"),
  notes: text("notes"),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Prescriptions ─────────────────────────────────────────
export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitId: uuid("visit_id")
    .references(() => visits.id)
    .notNull(),
  medicineName: varchar("medicine_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  frequency: varchar("frequency", { length: 50 }),
  duration: varchar("duration", { length: 50 }),
  instructions: text("instructions"),
  sortOrder: integer("sort_order").default(0),
});

// ─── Documents ─────────────────────────────────────────────
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  visitId: uuid("visit_id").references(() => visits.id),
  doctorId: uuid("doctor_id")
    .references(() => doctors.id)
    .notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
