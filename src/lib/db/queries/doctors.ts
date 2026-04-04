import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { doctors } from "@/lib/db/schema";
import type { Doctor, NewDoctor } from "@/lib/db/types";

// ─── Doctor Queries ────────────────────────────────────────
// All database operations related to the doctors table.
// Used by auth (login lookup) and settings (profile update).

export const doctorQueries = {
  // Find a doctor by their email address.
  // Used during login to look up credentials.
  async findByEmail(email: string): Promise<Doctor | null> {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, email))
      .limit(1);
    return doctor ?? null;
  },

  // Find a doctor by their UUID.
  // Used by getAuthenticatedDoctor() to verify the session.
  async findById(id: string): Promise<Doctor | null> {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, id))
      .limit(1);
    return doctor ?? null;
  },

  // Create a new doctor account.
  // passwordHash must be pre-hashed with bcrypt before calling this.
  async create(data: NewDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(data).returning();
    return doctor;
  },

  // Update a doctor's profile fields (name, email).
  // Only updates the provided fields; others remain unchanged.
  async updateProfile(
    id: string,
    data: Partial<Pick<Doctor, "name" | "email">>
  ): Promise<Doctor> {
    const [doctor] = await db
      .update(doctors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(doctors.id, id))
      .returning();
    return doctor;
  },
};
