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
//   - Only yes_no questions count toward the compliance percentage
//   - number/text/scale questions are tracked but don't affect the score
//   - Overall score = total "yes" answers / total possible across all yes_no questions
//   - Each yes_no question also gets its own individual score (for the breakdown bars)

// ─── Types ─────────────────────────────────────────────────

// Per-question compliance breakdown (used for progress bars on the UI)
export type QuestionMetric = {
  key: string;        // Question key (e.g., "took_meds")
  label: string;      // Human-readable label (e.g., "Did you take your medicine today?")
  done: number;       // Number of days the patient answered "yes"
  total: number;      // Total number of days in the window
  percentage: number;  // done / total * 100, rounded
};

export type ComplianceScore = {
  overall: number;              // 0-100 percentage across all yes_no questions
  metrics: QuestionMetric[];    // Per-question breakdown
};

// ─── Helper: Filter check-ins to the last N days ──────────
// Takes an array of check-ins (assumed sorted by date descending)
// and returns only those within the last N days from today.
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

// ─── Engine ────────────────────────────────────────────────

export const complianceEngine = {
  // Calculate compliance score over a time window.
  //
  // How it works:
  //   1. Filter to only yes_no questions that are enabled
  //   2. For each check-in day, check if the patient answered "yes"
  //   3. Per-question score = yes_days / total_days
  //   4. Overall score = sum(all yes answers) / sum(all possible) * 100
  //
  // The `days` parameter controls the window (default 7).
  // Returns both the overall percentage and per-question breakdown.
  calculateScore(
    checkIns: CheckIn[],
    enabledQuestions: string[],
    templateQuestions: TemplateQuestion[],
    days: number = 7
  ): ComplianceScore {
    const recent = filterLastNDays(checkIns, days);

    // Only yes_no questions that are enabled contribute to score
    const yesNoQuestions = templateQuestions.filter(
      (q) => q.type === "yes_no" && enabledQuestions.includes(q.key)
    );

    // Build per-question metrics
    const metrics: QuestionMetric[] = yesNoQuestions.map((q) => {
      const done = recent.filter(
        (c) => c.responses[q.key] === true
      ).length;
      const total = recent.length; // Total check-in days in window

      return {
        key: q.key,
        label: q.label,
        done,
        total,
        percentage: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });

    // Overall = total yes answers / total possible
    const totalDone = metrics.reduce((sum, m) => sum + m.done, 0);
    const totalPossible = metrics.reduce((sum, m) => sum + m.total, 0);
    const overall =
      totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

    return { overall, metrics };
  },

  // Detect compliance trend by comparing two 7-day windows.
  //
  // Logic:
  //   current  = compliance score for days 0-6 (this week)
  //   previous = compliance score for days 7-13 (last week)
  //   diff = current - previous
  //
  //   If diff > +10% → "improving"
  //   If diff < -10% → "worsening"
  //   Otherwise      → "stable"
  //
  // The 10% threshold prevents noise from small fluctuations.
  detectTrend(
    checkIns: CheckIn[],
    enabledQuestions: string[],
    templateQuestions: TemplateQuestion[]
  ): Trend {
    const THRESHOLD = 10;

    // Current week (days 0-6)
    const currentCheckIns = filterDayRange(checkIns, 0, 6);
    const current = this.calculateScore(
      currentCheckIns,
      enabledQuestions,
      templateQuestions,
      7
    );

    // Previous week (days 7-13)
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
  // Current rules (applied dynamically over all enabled yes_no questions):
  //   1. No check-in streak — if patient missed 3+ days in the last 7
  //   2. Per-question miss — if any yes_no question was answered "no"
  //      (or not answered) 3+ times in the last 7 days
  //   3. Weight trending up — if the most recent weight > earliest weight
  //      in the last 7 days (only when "weight" is an enabled question)
  //
  // Returns an array of human-readable strings for the insights panel.
  // Empty array means everything looks good.
  generateInsights(
    checkIns: CheckIn[],
    enabledQuestions: string[],
    templateQuestions: TemplateQuestion[]
  ): string[] {
    const insights: string[] = [];
    const last7 = filterLastNDays(checkIns, 7);

    // Rule 1: No check-in streak
    // If the patient has submitted fewer than 4 out of 7 days, flag it.
    const missedDays = 7 - last7.length;
    if (missedDays >= 3) {
      insights.push(`No check-in for ${missedDays} days this week`);
    }

    // Rule 2: Per yes_no question — check for repeated misses
    const yesNoQuestions = templateQuestions.filter(
      (q) => q.type === "yes_no" && enabledQuestions.includes(q.key)
    );

    for (const q of yesNoQuestions) {
      const missed = last7.filter(
        (c) => c.responses[q.key] !== true
      ).length;
      if (missed >= 3) {
        insights.push(`Missed "${q.label}" ${missed} times this week`);
      }
    }

    // Rule 3: Weight trending up (if weight question is enabled)
    if (enabledQuestions.includes("weight")) {
      const weights = last7
        .filter((c) => typeof c.responses.weight === "number")
        .map((c) => ({
          date: c.date,
          value: c.responses.weight as number,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)); // oldest first

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
