import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { trackingTemplates } from "@/lib/db/schema";
import type { TrackingTemplate, Condition } from "@/lib/db/types";

// ─── Template Queries ──────────────────────────────────────
// All database operations for tracking templates.
// In MVP, templates are system-default only (seeded on deploy).
// Future: doctors can create custom templates.

export const templateQueries = {
  // Get a template by its UUID.
  // Used to fetch the full question list for a patient's check-in form.
  async getById(id: string): Promise<TrackingTemplate | null> {
    const [template] = await db
      .select()
      .from(trackingTemplates)
      .where(eq(trackingTemplates.id, id))
      .limit(1);
    return template ?? null;
  },

  // List all templates for a given condition.
  // In MVP this returns just the default template, but the query
  // supports multiple templates per condition for future use.
  // Used by GET /api/templates?condition=diabetes.
  async listByCondition(condition: Condition): Promise<TrackingTemplate[]> {
    return db
      .select()
      .from(trackingTemplates)
      .where(eq(trackingTemplates.condition, condition));
  },
};
