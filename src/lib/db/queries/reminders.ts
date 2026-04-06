import { eq, and, lte, or, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  reminderConfigs,
  doctorPatients,
  patients,
  doctors,
} from "@/lib/db/schema";

// ─── Reminder Config Queries ───────────────────────────────
// All database operations for WhatsApp reminder configurations.
// Feature-flagged via WHATSAPP_ENABLED env var — these queries
// only run when the cron job triggers /api/reminders/send.

export const reminderQueries = {
  // Get all reminders that are due to be sent.
  // A reminder is due if:
  //   1. It's enabled
  //   2. Its reminder_time <= current time (within the hour window)
  //   3. It hasn't been sent today (lastSentAt is null or before today)
  //
  // Returns patient + doctor info needed to compose the WhatsApp message.
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
  async markSent(id: string): Promise<void> {
    await db
      .update(reminderConfigs)
      .set({ lastSentAt: new Date() })
      .where(eq(reminderConfigs.id, id));
  },
};
