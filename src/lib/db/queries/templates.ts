import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { trackingTemplates, doctorPatients } from "@/lib/db/schema";
import type { TrackingTemplate, Condition } from "@/lib/db/types";

// ─── Template Queries ──────────────────────────────────────
// All database operations for tracking templates.
// In MVP, templates are system-default only (seeded on deploy).
// Future: doctors can create custom templates.

export const templateQueries = {
  // Get the default template for a condition (diabetes or obesity).
  // Each condition has exactly one default template (is_default = true).
  // Used when creating a patient to auto-assign the right template.
  async getDefaultByCondition(
    condition: Condition
  ): Promise<TrackingTemplate | null> {
    const [template] = await db
      .select()
      .from(trackingTemplates)
      .where(
        and(
          eq(trackingTemplates.condition, condition),
          eq(trackingTemplates.isDefault, true)
        )
      )
      .limit(1);
    return template ?? null;
  },

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

  // Update which questions are enabled for a specific doctor_patient.
  // Validates that the provided keys exist in the assigned template
  // before updating. Throws if any key is invalid.
  //
  // Used by POST /api/templates/assign when a doctor toggles questions.
  async updateEnabledQuestions(
    doctorPatientId: string,
    enabledQuestions: string[]
  ): Promise<void> {
    // Fetch the doctor_patient to get the template ID
    const [dp] = await db
      .select()
      .from(doctorPatients)
      .where(eq(doctorPatients.id, doctorPatientId))
      .limit(1);

    if (!dp) {
      throw new Error("Doctor-patient record not found");
    }

    // Fetch the template to validate question keys
    const template = await this.getById(dp.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Validate that every enabled key exists in the template
    const validKeys = new Set(template.questions.map((q) => q.key));
    const invalidKeys = enabledQuestions.filter((k) => !validKeys.has(k));
    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid question keys: ${invalidKeys.join(", ")}`
      );
    }

    // Update the enabled questions on the doctor_patient record
    await db
      .update(doctorPatients)
      .set({ enabledQuestions })
      .where(eq(doctorPatients.id, doctorPatientId));
  },
};
