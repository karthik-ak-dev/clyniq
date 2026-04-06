import { gte, desc, inArray, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { checkIns } from "@/lib/db/schema";
import { checkinQueries } from "./checkins";
import { templateQueries } from "./templates";
import { complianceEngine } from "@/lib/compliance/engine";
import type { DoctorPatient, CheckIn } from "@/lib/db/types";

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
  // Accepts optional pre-fetched template and checkIns to avoid duplicate queries.
  async getForPatient(
    doctorPatient: DoctorPatient,
    prefetched?: { template?: Awaited<ReturnType<typeof templateQueries.getById>>; checkIns?: CheckIn[] }
  ) {
    // Use prefetched data or fetch in parallel
    const [template, patientCheckIns] = prefetched?.template && prefetched?.checkIns
      ? [prefetched.template, prefetched.checkIns]
      : await Promise.all([
          prefetched?.template ?? templateQueries.getById(doctorPatient.templateId),
          prefetched?.checkIns ?? checkinQueries.getLastNDays(doctorPatient.id, 14),
        ]);

    if (!template) {
      throw new Error("Template not found");
    }

    // Calculate everything via the compliance engine
    const score = complianceEngine.calculateScore(
      patientCheckIns,
      doctorPatient.enabledQuestions,
      template.questions
    );
    const trend = complianceEngine.detectTrend(
      patientCheckIns,
      doctorPatient.enabledQuestions,
      template.questions
    );
    const insights = complianceEngine.generateInsights(
      patientCheckIns,
      doctorPatient.enabledQuestions,
      template.questions
    );

    return { score, trend, insights };
  },

  // Batch compliance + lastCheckIn for multiple patients.
  // Reduces N+1 to 2 queries (1 for all check-ins, 1 for all templates).
  async getForPatients(doctorPatients: DoctorPatient[]) {
    if (doctorPatients.length === 0) return new Map();

    const dpIds = doctorPatients.map((dp) => dp.id);
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const sinceStr = since.toISOString().split("T")[0];

    // Batch fetch unique templates (usually just 1-2)
    const templateIds = [...new Set(doctorPatients.map((dp) => dp.templateId))];

    // Run both queries in parallel — check-ins + templates
    const [allCheckIns, ...templates] = await Promise.all([
      db
        .select()
        .from(checkIns)
        .where(
          and(
            inArray(checkIns.doctorPatientId, dpIds),
            gte(checkIns.date, sinceStr)
          )
        )
        .orderBy(desc(checkIns.date)),
      ...templateIds.map((id) => templateQueries.getById(id)),
    ]);

    // Group by doctorPatientId
    const checkInMap = new Map<string, CheckIn[]>();
    for (const ci of allCheckIns) {
      const list = checkInMap.get(ci.doctorPatientId) || [];
      list.push(ci);
      checkInMap.set(ci.doctorPatientId, list);
    }

    const templateMap = new Map(templates.filter(Boolean).map((t) => [t!.id, t!]));

    // Calculate compliance for each patient
    const results = new Map<string, {
      compliance: { score: ReturnType<typeof complianceEngine.calculateScore>; trend: ReturnType<typeof complianceEngine.detectTrend>; insights: string[] };
      lastCheckIn: string | null;
    }>();

    for (const dp of doctorPatients) {
      const template = templateMap.get(dp.templateId);
      const patientCheckIns = checkInMap.get(dp.id) || [];
      const lastCheckIn = patientCheckIns.length > 0 ? patientCheckIns[0].date : null;

      if (!template) {
        results.set(dp.id, {
          compliance: { score: { overall: 0, metrics: [] }, trend: "stable" as const, insights: [] },
          lastCheckIn,
        });
        continue;
      }

      const score = complianceEngine.calculateScore(patientCheckIns, dp.enabledQuestions, template.questions);
      const trend = complianceEngine.detectTrend(patientCheckIns, dp.enabledQuestions, template.questions);
      const insights = complianceEngine.generateInsights(patientCheckIns, dp.enabledQuestions, template.questions);

      results.set(dp.id, { compliance: { score, trend, insights }, lastCheckIn });
    }

    return results;
  },
};
