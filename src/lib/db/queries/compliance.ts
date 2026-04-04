import { checkinQueries } from "./checkins";
import { templateQueries } from "./templates";
import { complianceEngine } from "@/lib/compliance/engine";
import type { DoctorPatient } from "@/lib/db/types";

// ─── Compliance Queries ────────────────────────────────────
// Orchestrates data fetching + compliance engine calculations.
// This module bridges the raw check-in data (from checkinQueries)
// with the scoring logic (from complianceEngine).
//
// Why this exists:
//   API routes call complianceQueries, which internally fetches
//   check-ins + template, then delegates to the engine for scoring.
//   This keeps API routes thin and the engine pure (no DB access).

export const complianceQueries = {
  // Get full compliance data for one patient.
  // Returns score, per-question breakdown, trend, and insights.
  // Used by GET /api/compliance/[patientId] and the patient detail page.
  async getForPatient(doctorPatient: DoctorPatient) {
    // Fetch the template to get question definitions
    const template = await templateQueries.getById(doctorPatient.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Fetch last 14 days of check-ins (needed for trend: current 7 vs previous 7)
    const checkIns = await checkinQueries.getLastNDays(
      doctorPatient.id,
      14
    );

    // Calculate everything via the compliance engine
    const score = complianceEngine.calculateScore(
      checkIns,
      doctorPatient.enabledQuestions,
      template.questions
    );
    const trend = complianceEngine.detectTrend(
      checkIns,
      doctorPatient.enabledQuestions,
      template.questions
    );
    const insights = complianceEngine.generateInsights(
      checkIns,
      doctorPatient.enabledQuestions,
      template.questions
    );

    return { score, trend, insights };
  },
};
