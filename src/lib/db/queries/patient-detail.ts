// ─── Patient Detail Query ──────────────────────────────────
// Single function that returns everything the patient detail
// page needs, fully pre-computed. The page component becomes
// a thin data-fetching shell with zero business logic.
//
// All compliance scoring, trend detection, streak calculation,
// and data aggregation happens here — not in the page component.

import { patientQueries } from "./patients";
import { templateQueries } from "./templates";
import { checkinQueries } from "./checkins";
import { visitQueries } from "./visits";
import { complianceEngine } from "@/lib/compliance/engine";
import { categorizeQuestion } from "@/lib/utils/format-helpers";
import type {
  PatientDetailData,
  ChartPoint,
  NumericTrend,
  CalendarEntry,
  ComplianceGroup,
  CheckIn,
  TemplateQuestion,
} from "@/lib/db/types";

// ─── Helpers: date range builders ─────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function filterDateRange(checkIns: CheckIn[], from: string, to: string): CheckIn[] {
  return checkIns.filter((c) => c.date >= from && c.date <= to);
}

// ─── Aggregation: monthly scores (last 6 months) ──────────

function buildMonthlyData(
  checkIns: CheckIn[],
  enabledQuestions: string[],
  questions: TemplateQuestion[]
): ChartPoint[] {
  const result: ChartPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const name = d.toLocaleDateString("en", { month: "short" });
    const start = toDateStr(new Date(d.getFullYear(), d.getMonth(), 1));
    const end = toDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    const filtered = filterDateRange(checkIns, start, end);
    const s = complianceEngine.calculateScore(filtered, enabledQuestions, questions, 31);
    result.push({ name, score: s.overall });
  }
  return result;
}

// ─── Aggregation: weekly scores (last 4 weeks) ────────────

function buildWeeklyData(
  checkIns: CheckIn[],
  enabledQuestions: string[],
  questions: TemplateQuestion[]
): ChartPoint[] {
  const result: ChartPoint[] = [];
  for (let i = 3; i >= 0; i--) {
    const end = new Date();
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const filtered = filterDateRange(checkIns, toDateStr(start), toDateStr(end));
    const s = complianceEngine.calculateScore(filtered, enabledQuestions, questions, 7);
    result.push({ name: `W${4 - i}`, score: s.overall });
  }
  return result;
}

// ─── Aggregation: daily compliance (last 7 days) ──────────

function buildDailyCompliance(
  checkIns: CheckIn[],
  enabledQuestions: string[],
  questions: TemplateQuestion[]
): ChartPoint[] {
  const result: ChartPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDateStr(d);
    const name = d.toLocaleDateString("en", { weekday: "short" });
    const ci = checkIns.find((c) => c.date === dateStr);
    result.push({
      name,
      score: ci ? complianceEngine.calculateDayScore(ci, enabledQuestions, questions) : 0,
    });
  }
  return result;
}

// ─── Aggregation: numeric trends (last 14 days) ───────────

function buildNumericTrends(
  checkIns: CheckIn[],
  enabledQuestions: string[],
  questions: TemplateQuestion[]
): NumericTrend[] {
  const enabledSet = new Set(enabledQuestions);
  return questions
    .filter((q) => q.type === "number" && enabledSet.has(q.key))
    .map((q) => {
      const data = complianceEngine.getNumericHistory(checkIns, q.key, 14);
      const latest = data.length > 0 ? data[data.length - 1] : null;
      const prev = data.length > 1 ? data[data.length - 2] : null;
      const rawDiff = prev && latest ? latest.value - prev.value : 0;
      return {
        key: q.key,
        label: q.label,
        unit: q.unit || "",
        latestValue: latest?.value ?? null,
        diff: Math.round(rawDiff * 10) / 10,
        data,
      };
    });
}

// ─── Aggregation: calendar data (all check-ins) ───────────

function buildCalendarData(
  checkIns: CheckIn[],
  enabledQuestions: string[],
  questions: TemplateQuestion[]
): Record<string, CalendarEntry> {
  const result: Record<string, CalendarEntry> = {};
  for (const ci of checkIns) {
    result[ci.date] = {
      score: complianceEngine.calculateDayScore(ci, enabledQuestions, questions),
      responses: ci.responses as Record<string, unknown>,
    };
  }
  return result;
}

// ─── Aggregation: compliance groups (pre-categorized) ─────

function buildComplianceGroups(
  metrics: import("@/lib/compliance/engine").QuestionMetric[]
): ComplianceGroup[] {
  const groups: Record<string, import("@/lib/compliance/engine").QuestionMetric[]> = {};
  for (const m of metrics) {
    const cat = categorizeQuestion(m.key, m.label);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(m);
  }
  const categoryOrder = ["Medication", "Lifestyle", "Monitoring", "Other"];
  return categoryOrder
    .filter((cat) => groups[cat]?.length)
    .map((cat) => ({ category: cat, items: groups[cat] }));
}

// ─── Trend diff: current vs previous week ─────────────────

function calculateTrendDiff(
  checkIns: CheckIn[],
  enabledQuestions: string[],
  questions: TemplateQuestion[],
  currentScore: number
): number {
  const d = new Date();
  const from = new Date(d);
  from.setDate(d.getDate() - 13);
  const to = new Date(d);
  to.setDate(d.getDate() - 7);
  const prevCheckIns = filterDateRange(checkIns, toDateStr(from), toDateStr(to));
  const prevScore = complianceEngine.calculateScore(prevCheckIns, enabledQuestions, questions, 7);
  return currentScore - prevScore.overall;
}

// ─── Main Query ───────────────────────────────────────────

export const patientDetailQueries = {
  /**
   * Fetches and pre-computes ALL data for the patient detail page.
   * Returns null if the patient doesn't exist or doesn't belong to the doctor.
   */
  async getData(patientId: string, doctorId: string): Promise<PatientDetailData | null> {
    // 1. Fetch patient + doctor-patient link
    const row = await patientQueries.findByPatientId(patientId, doctorId);
    if (!row) return null;

    const { patient, doctorPatient } = row;

    // 2. Parallel fetch: template, all check-ins, all visits
    const [template, allCheckIns, visits] = await Promise.all([
      templateQueries.getById(doctorPatient.templateId),
      checkinQueries.getAll(doctorPatient.id),
      visitQueries.getByDoctorPatientId(doctorPatient.id),
    ]);

    if (!template) return null;

    // 3. Merge template + custom questions
    const customQuestions = (doctorPatient.customQuestions as typeof template.questions) || [];
    const allQuestions = [...template.questions, ...customQuestions];
    const enabledQuestions = doctorPatient.enabledQuestions;

    // 4. Compliance scoring (pure engine, no DB)
    const compliance = complianceEngine.calculateScore(allCheckIns, enabledQuestions, allQuestions, 7);
    const trend = complianceEngine.detectTrend(allCheckIns, enabledQuestions, allQuestions);
    const insights = complianceEngine.generateInsights(allCheckIns, enabledQuestions, allQuestions);

    // 5. Derived stats
    const todayStr = toDateStr(new Date());
    const checkedInToday = allCheckIns.some((c) => c.date === todayStr);
    const streak = complianceEngine.calculateStreak(allCheckIns);
    const trendDiff = calculateTrendDiff(allCheckIns, enabledQuestions, allQuestions, compliance.overall);

    // 6. Aggregated data for charts & views
    const monthlyData = buildMonthlyData(allCheckIns, enabledQuestions, allQuestions);
    const weeklyData = buildWeeklyData(allCheckIns, enabledQuestions, allQuestions);
    const dailyCompliance = buildDailyCompliance(allCheckIns, enabledQuestions, allQuestions);
    const numericTrends = buildNumericTrends(allCheckIns, enabledQuestions, allQuestions);
    const calendarData = buildCalendarData(allCheckIns, enabledQuestions, allQuestions);
    const complianceGroups = buildComplianceGroups(compliance.metrics);
    const lastCheckIn = allCheckIns.length > 0 ? allCheckIns[allCheckIns.length - 1] : null;

    return {
      patient,
      doctorPatient,
      template,
      allQuestions,
      compliance,
      trend,
      trendDiff,
      insights,
      checkedInToday,
      streak,
      monthlyData,
      weeklyData,
      dailyCompliance,
      numericTrends,
      complianceGroups,
      calendarData,
      lastCheckIn,
      visits,
    };
  },
};
