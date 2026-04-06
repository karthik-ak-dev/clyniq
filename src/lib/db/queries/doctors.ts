import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { doctors } from "@/lib/db/schema";
import type { Doctor } from "@/lib/db/types";

// ─── Doctor Queries ────────────────────────────────────────
// Database operations for the doctors table.

export const doctorQueries = {
  // Find a doctor by email. Used during login.
  async findByEmail(email: string): Promise<Doctor | null> {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, email))
      .limit(1);
    return doctor ?? null;
  },

  // Find a doctor by UUID. Used by getAuthenticatedDoctor().
  async findById(id: string): Promise<Doctor | null> {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, id))
      .limit(1);
    return doctor ?? null;
  },
};
