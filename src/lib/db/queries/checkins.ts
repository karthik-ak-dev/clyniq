import { eq, and, gte, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { checkIns } from "@/lib/db/schema";
import type { CheckIn, NewCheckIn } from "@/lib/db/types";

// ─── Check-in Queries ──────────────────────────────────────
// All database operations for daily patient check-ins.
// Check-ins store dynamic JSONB responses keyed by question keys.
// The UNIQUE(doctor_patient_id, date) constraint enforces one check-in per day.

export const checkinQueries = {
  // Submit a new check-in for a patient.
  // Throws a DB error if the patient already checked in today
  // (unique constraint on doctor_patient_id + date).
  async create(data: NewCheckIn): Promise<CheckIn> {
    const [checkin] = await db.insert(checkIns).values(data).returning();
    return checkin;
  },

  // Check if a check-in already exists for a patient on a given date.
  // Used to show "already checked in" state on the patient page
  // and to prevent double submissions at the API level.
  async existsForDate(
    doctorPatientId: string,
    date: string // ISO format: YYYY-MM-DD
  ): Promise<boolean> {
    const [existing] = await db
      .select({ id: checkIns.id })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.doctorPatientId, doctorPatientId),
          eq(checkIns.date, date)
        )
      )
      .limit(1);
    return !!existing;
  },

  // Get all check-ins for a patient within the last N days.
  // Used by the compliance engine to calculate scores and trends.
  // Returns check-ins sorted by date descending (most recent first).
  async getLastNDays(
    doctorPatientId: string,
    days: number
  ): Promise<CheckIn[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0]; // YYYY-MM-DD

    return db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.doctorPatientId, doctorPatientId),
          gte(checkIns.date, sinceStr)
        )
      )
      .orderBy(desc(checkIns.date));
  },

  // Get all check-ins for a patient (no date filter).
  // Used for the full activity timeline view.
  // Returns check-ins sorted by date descending.
  async findByDoctorPatientId(
    doctorPatientId: string
  ): Promise<CheckIn[]> {
    return db
      .select()
      .from(checkIns)
      .where(eq(checkIns.doctorPatientId, doctorPatientId))
      .orderBy(desc(checkIns.date));
  },
};
