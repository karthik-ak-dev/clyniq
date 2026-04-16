import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import type { Visit, NewVisit } from "@/lib/db/types";

export const visitQueries = {
  async create(data: NewVisit): Promise<Visit> {
    const [visit] = await db.insert(visits).values(data).returning();
    return visit;
  },

  async getByDoctorPatientId(doctorPatientId: string): Promise<Visit[]> {
    return db
      .select()
      .from(visits)
      .where(eq(visits.doctorPatientId, doctorPatientId))
      .orderBy(desc(visits.visitDate));
  },
};
