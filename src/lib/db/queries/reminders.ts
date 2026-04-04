import { eq, and, lte, or, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  reminderConfigs,
  doctorPatients,
  patients,
  doctors,
} from "@/lib/db/schema";
import type { ReminderConfig, NewReminderConfig } from "@/lib/db/types";

// ─── Reminder Config Queries ───────────────────────────────
// All database operations for WhatsApp reminder configurations.
// Feature-flagged via WHATSAPP_ENABLED env var — these queries
// only run when the cron job triggers /api/reminders/send.

export const reminderQueries = {
  // Create a reminder config for a patient.
  // Called when a doctor enables reminders during patient setup.
  async create(data: NewReminderConfig): Promise<ReminderConfig> {
    const [config] = await db
      .insert(reminderConfigs)
      .values(data)
      .returning();
    return config;
  },

  // Get the reminder config for a specific doctor-patient link.
  // Returns null if no reminder is configured.
  async getByDoctorPatientId(
    doctorPatientId: string
  ): Promise<ReminderConfig | null> {
    const [config] = await db
      .select()
      .from(reminderConfigs)
      .where(eq(reminderConfigs.doctorPatientId, doctorPatientId))
      .limit(1);
    return config ?? null;
  },

  // Get all reminders that are due to be sent.
  // A reminder is due if:
  //   1. It's enabled
  //   2. Its reminder_time <= current time (within the hour window)
  //   3. It hasn't been sent today (lastSentAt is null or before today)
  //
  // Returns patient + doctor info needed to compose the WhatsApp message.
  // Used by the cron job POST /api/reminders/send.
  async getDueReminders(currentTime: string, todayDate: Date) {
    const startOfToday = new Date(todayDate);
    startOfToday.setHours(0, 0, 0, 0);

    return db
      .select({
        config: reminderConfigs,
        patientName: patients.name,
        patientPhone: patients.phone,
        doctorName: doctors.name,
        magicToken: doctorPatients.magicToken,
      })
      .from(reminderConfigs)
      .innerJoin(
        doctorPatients,
        eq(doctorPatients.id, reminderConfigs.doctorPatientId)
      )
      .innerJoin(patients, eq(patients.id, doctorPatients.patientId))
      .innerJoin(doctors, eq(doctors.id, doctorPatients.doctorId))
      .where(
        and(
          eq(reminderConfigs.enabled, true),
          lte(reminderConfigs.reminderTime, currentTime),
          or(
            isNull(reminderConfigs.lastSentAt),
            lte(reminderConfigs.lastSentAt, startOfToday)
          )
        )
      );
  },

  // Mark a reminder as sent by updating lastSentAt to now.
  // Called after successfully sending the WhatsApp message.
  async markSent(id: string): Promise<void> {
    await db
      .update(reminderConfigs)
      .set({ lastSentAt: new Date() })
      .where(eq(reminderConfigs.id, id));
  },

  // Toggle a reminder on or off.
  // Used by the doctor from the patient settings.
  async setEnabled(id: string, enabled: boolean): Promise<void> {
    await db
      .update(reminderConfigs)
      .set({ enabled })
      .where(eq(reminderConfigs.id, id));
  },
};
