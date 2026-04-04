import type { CheckIn, TemplateQuestion, Trend } from "@/lib/db/types";
import { TREND } from "@/lib/db/types";

// ─── Compliance Engine ─────────────────────────────────────
// Pure calculation module — no database access, no side effects.
// Takes check-in data + template config, returns scores/trends/insights.
//
// Key design principle: works generically over ANY set of enabled questions.
// Nothing is hardcoded to "took_meds" or "followed_diet" — the engine
// iterates over whatever question keys are in the template.
//
// Scoring rules:
//   - yes_no questions: true = compliant, false = not
//   - choice questions: first option = most compliant, last = least
//     A response is "compliant" if it's one of the top 2 options.
//     e.g., ["Perfect", "Good", "Okay", "Poor"] → "Perfect" or "Good" = compliant
//   - multi_choice, number, text, scale: tracked but NOT scored
//   - Overall score = total compliant answers / total possible across scored questions
//   - Each scored question gets its own individual metric (for breakdown bars)

// ─── Types ─────────────────────────────────────────────────

// Per-question compliance breakdown (used for progress bars on the UI)
export type QuestionMetric = {
  key: string;        // Question key (e.g., "took_meds")
  label: string;      // Human-readable label
  done: number;       // Number of days the patient was compliant
  total: number;      // Total number of check-in days in the window
  percentage: number;  // done / total * 100, rounded
};

export type ComplianceScore = {
  overall: number;              // 0-100 percentage across all scored questions
  metrics: QuestionMetric[];    // Per-question breakdown
};

// ─── Helper: Filter check-ins to the last N days ──────────
function filterLastNDays(checkIns: CheckIn[], days: number): CheckIn[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  return checkIns.filter((c) => c.date >= cutoffStr);
}

// ─── Helper: Filter to a specific day range ────────────────
// Returns check-ins between `fromDaysAgo` and `toDaysAgo` (inclusive).
// Used for trend detection: compare days 0-6 vs days 7-13.
function filterDayRange(
  checkIns: CheckIn[],
  fromDaysAgo: number,
  toDaysAgo: number
): CheckIn[] {
  const now = new Date();

  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - fromDaysAgo);
  const fromStr = fromDate.toISOString().split("T")[0];

  const toDate = new Date(now);
  toDate.setDate(toDate.getDate() - toDaysAgo);
  const toStr = toDate.toISOString().split("T")[0];

  return checkIns.filter((c) => c.date >= toStr && c.date <= fromStr);
}

// ─── Helper: Check if a response is "compliant" ───────────
// For yes_no: true = compliant
// For choice: top 2 options = compliant (e.g., "Perfect"/"Good" out of 4)
function isCompliant(
  question: TemplateQuestion,
  value: boolean | number | string | string[] | undefined
): boolean {
  if (value === undefined || value === null) return false;

  if (question.type === "yes_no") {
    return value === true;
  }

  if (question.type === "choice" && question.options && typeof value === "string") {
    // Top 2 options count as compliant (or top 1 if only 2 options)
    const compliantCount = Math.max(1, Math.ceil(question.options.length / 2));
    const compliantOptions = question.options.slice(0, compliantCount);
    return compliantOptions.includes(value);
  }

  return false;
}

// ─── Helper: Get scorable questions ────────────────────────
// Returns enabled questions that contribute to the compliance score.
// Only yes_no and choice types are scored.
function getScorableQuestions(
  enabledQuestions: string[],
  templateQuestions: TemplateQuestion[]
): TemplateQuestion[] {
  return templateQuestions.filter(
    (q) =>
      (q.type === "yes_no" || q.type === "choice") &&
      enabledQuestions.includes(q.key)
  );
}

// ─── Engine ────────────────────────────────────────────────

export const complianceEngine = {
  // Calculate compliance score over a time window.
  //
  // Scores yes_no + choice questions:
  //   - yes_no: true = compliant
  //   - choice: top half of options = compliant
  //
  // Returns both the overall percentage and per-question breakdown.
  calculateScore(
    checkIns: CheckIn[],
    enabledQuestions: string[],
    templateQuestions: TemplateQuestion[],
    days: number = 7
  ): ComplianceScore {
    const recent = filterLastNDays(checkIns, days);
    const scorable = getScorableQuestions(enabledQuestions, templateQuestions);

    // Build per-question metrics
    const metrics: QuestionMetric[] = scorable.map((q) => {
      const done = recent.filter((c) =>
        isCompliant(q, c.responses[q.key])
      ).length;
      const total = recent.length;

      return {
        key: q.key,
        label: q.label,
        done,
        total,
        percentage: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });

    // Overall = total compliant answers / total possible
    const totalDone = metrics.reduce((sum, m) => sum + m.done, 0);
    const totalPossible = metrics.reduce((sum, m) => sum + m.total, 0);
    const overall =
      totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

    return { overall, metrics };
  },

  // Detect compliance trend by comparing two 7-day windows.
  //
  //   current  = compliance score for days 0-6 (this week)
  //   previous = compliance score for days 7-13 (last week)
  //   diff > +10% → improving, diff < -10% → worsening, else → stable
  detectTrend(
    checkIns: CheckIn[],
    enabledQuestions: string[],
    templateQuestions: TemplateQuestion[]
  ): Trend {
    const THRESHOLD = 10;

    const currentCheckIns = filterDayRange(checkIns, 0, 6);
    const current = this.calculateScore(
      currentCheckIns,
      enabledQuestions,
      templateQuestions,
      7
    );

    const previousCheckIns = filterDayRange(checkIns, 7, 13);
    const previous = this.calculateScore(
      previousCheckIns,
      enabledQuestions,
      templateQuestions,
      7
    );

    const diff = current.overall - previous.overall;

    if (diff > THRESHOLD) return TREND.IMPROVING;
    if (diff < -THRESHOLD) return TREND.WORSENING;
    return TREND.STABLE;
  },

  // Generate rule-based insight strings for the doctor dashboard.
  //
  // Rules:
  //   1. No check-in streak — missed 3+ days in last 7
  //   2. Per scored question — non-compliant 3+ times in last 7 days
  //   3. Choice questions — consistently picking worst options
  //   4. Weight trending up (if weight is enabled)
  //
  // Returns human-readable strings. Empty array = everything looks good.
  generateInsights(
    checkIns: CheckIn[],
    enabledQuestions: string[],
    templateQuestions: TemplateQuestion[]
  ): string[] {
    const insights: string[] = [];
    const last7 = filterLastNDays(checkIns, 7);

    // Rule 1: No check-in streak
    const missedDays = 7 - last7.length;
    if (missedDays >= 3) {
      insights.push(`No check-in for ${missedDays} days this week`);
    }

    // Rule 2: Per scored question — check for repeated non-compliance
    const scorable = getScorableQuestions(enabledQuestions, templateQuestions);

    for (const q of scorable) {
      const nonCompliant = last7.filter(
        (c) => !isCompliant(q, c.responses[q.key])
      ).length;
      if (nonCompliant >= 3) {
        // Use a friendly label based on question type
        if (q.type === "yes_no") {
          insights.push(`Missed "${q.label}" ${nonCompliant} times this week`);
        } else if (q.type === "choice") {
          insights.push(`"${q.label}" has been low ${nonCompliant} times this week`);
        }
      }
    }

    // Rule 3: Choice questions — check if consistently picking worst option
    const choiceQuestions = templateQuestions.filter(
      (q) => q.type === "choice" && enabledQuestions.includes(q.key) && q.options
    );

    for (const q of choiceQuestions) {
      const worstOption = q.options![q.options!.length - 1];
      const worstCount = last7.filter(
        (c) => c.responses[q.key] === worstOption
      ).length;
      if (worstCount >= 3) {
        insights.push(`"${q.label}" consistently "${worstOption}"`);
      }
    }

    // Rule 4: Weight trending up (if weight question is enabled)
    if (enabledQuestions.includes("weight")) {
      const weights = last7
        .filter((c) => typeof c.responses.weight === "number")
        .map((c) => ({
          date: c.date,
          value: c.responses.weight as number,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (
        weights.length >= 2 &&
        weights[weights.length - 1].value > weights[0].value
      ) {
        insights.push("Weight trending up");
      }
    }

    return insights;
  },
};
