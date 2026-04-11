import { redirect, notFound } from "next/navigation";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { patientQueries, checkinQueries, templateQueries } from "@/lib/db/queries";
import { complianceEngine } from "@/lib/compliance/engine";
import { PatientDetail } from "@/components/dashboard/patient-detail";
import type { CheckIn, TemplateQuestion } from "@/lib/db/types";

export const metadata = {
  title: "Patient Detail — DoctorRx",
};

// Helper: compute daily compliance for a check-in
function getDayScore(
  ci: CheckIn,
  enabledQuestions: string[],
  questions: TemplateQuestion[]
): number {
  const scorable = questions.filter(
    (q) => (q.type === "yes_no" || q.type === "choice") && enabledQuestions.includes(q.key)
  );
  if (scorable.length === 0) return 0;

  let compliant = 0;
  for (const q of scorable) {
    const val = ci.responses[q.key];
    if (q.type === "yes_no" && val === true) compliant++;
    if (q.type === "choice" && q.options && typeof val === "string") {
      const topHalf = Math.max(1, Math.ceil(q.options.length / 2));
      if (q.options.slice(0, topHalf).includes(val)) compliant++;
    }
  }
  return Math.round((compliant / scorable.length) * 100);
}

// Helper: extract numeric values over time for a question key
function getNumericHistory(
  checkIns: CheckIn[],
  key: string,
  days: number = 14
): { date: string; value: number }[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return checkIns
    .filter((c) => c.date >= cutoffStr && typeof c.responses[key] === "number")
    .map((c) => ({ date: c.date, value: c.responses[key] as number }));
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) redirect("/login");

  const { id } = await params;

  const row = await patientQueries.findByPatientId(id, doctor.id);
  if (!row) notFound();

  const { patient, doctorPatient } = row;

  const [template, allCheckIns] = await Promise.all([
    templateQueries.getById(doctorPatient.templateId),
    checkinQueries.getAll(doctorPatient.id),
  ]);

  if (!template) notFound();

  const customQuestions = (doctorPatient.customQuestions as typeof template.questions) || [];
  const allQuestions = [...template.questions, ...customQuestions];

  // ── Compliance scores ──
  const compliance = complianceEngine.calculateScore(
    allCheckIns, doctorPatient.enabledQuestions, allQuestions, 7
  );
  const trend = complianceEngine.detectTrend(
    allCheckIns, doctorPatient.enabledQuestions, allQuestions
  );
  const insights = complianceEngine.generateInsights(
    allCheckIns, doctorPatient.enabledQuestions, allQuestions
  );

  // ── Today's check-in ──
  const todayStr = new Date().toISOString().slice(0, 10);
  const checkedInToday = allCheckIns.some((c) => c.date === todayStr);

  // ── Streak ──
  let streak = 0;
  if (allCheckIns.length > 0) {
    const sorted = [...allCheckIns].sort((a, b) => b.date.localeCompare(a.date));
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (sorted[0].date === todayStr || sorted[0].date === yesterdayStr) {
      let expectedDate = new Date(sorted[0].date + "T00:00:00");
      for (const ci of sorted) {
        if (ci.date === expectedDate.toISOString().slice(0, 10)) {
          streak++;
          expectedDate = new Date(expectedDate.getTime() - 86400000);
        } else break;
      }
    }
  }

  // ── Previous week score (for trend %) ──
  const prevWeekScore = complianceEngine.calculateScore(
    allCheckIns.filter((c) => {
      const d = new Date();
      const from = new Date(d); from.setDate(d.getDate() - 13);
      const to = new Date(d); to.setDate(d.getDate() - 7);
      return c.date >= from.toISOString().slice(0, 10) && c.date <= to.toISOString().slice(0, 10);
    }),
    doctorPatient.enabledQuestions, allQuestions, 7
  );
  const trendDiff = compliance.overall - prevWeekScore.overall;

  // ── Monthly data (last 6 months) ──
  const monthlyData: { month: string; score: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleDateString("en", { month: "short" });
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    const monthCIs = allCheckIns.filter((c) => c.date >= start && c.date <= end);
    const s = complianceEngine.calculateScore(monthCIs, doctorPatient.enabledQuestions, allQuestions, 31);
    monthlyData.push({ month: monthStr, score: s.overall });
  }

  // ── Weekly data (last 4 weeks, per week) ──
  const weeklyData: { week: string; score: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const end = new Date(); end.setDate(end.getDate() - i * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const weekCIs = allCheckIns.filter((c) => c.date >= startStr && c.date <= endStr);
    const s = complianceEngine.calculateScore(weekCIs, doctorPatient.enabledQuestions, allQuestions, 7);
    weeklyData.push({ week: `W${4 - i}`, score: s.overall });
  }

  // ── Daily compliance (last 7 days with %) ──
  const dailyCompliance: { day: string; date: string; score: number; answered: number; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString("en", { weekday: "short" });
    const ci = allCheckIns.find((c) => c.date === dateStr);
    const enabledCount = doctorPatient.enabledQuestions.length + customQuestions.length;
    dailyCompliance.push({
      day: dayName,
      date: dateStr,
      score: ci ? getDayScore(ci, doctorPatient.enabledQuestions, allQuestions) : 0,
      answered: ci ? Object.keys(ci.responses).length : 0,
      total: enabledCount,
    });
  }

  // ── Recent check-ins with scores ──
  const recentCheckins = [...allCheckIns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)
    .map((ci) => ({
      date: ci.date,
      score: getDayScore(ci, doctorPatient.enabledQuestions, allQuestions),
      answered: Object.keys(ci.responses).length,
      total: doctorPatient.enabledQuestions.length + customQuestions.length,
    }));

  // ── Numeric trends (blood sugar, weight, BP etc.) ──
  const enabledSet = new Set(doctorPatient.enabledQuestions);
  const numericQuestions = allQuestions.filter(
    (q) => q.type === "number" && enabledSet.has(q.key)
  );
  const numericTrends = numericQuestions
    .map((q) => ({
      key: q.key,
      label: q.label,
      unit: q.unit || "",
      data: getNumericHistory(allCheckIns, q.key, 14),
    }))
    .filter((t) => t.data.length > 0); // Only show if there's actual data

  // ── Calendar dates ──
  const checkinDates = allCheckIns.map((c) => c.date);

  // ── Last check-in ──
  const lastCheckIn = allCheckIns.length > 0 ? allCheckIns[allCheckIns.length - 1] : null;

  return (
    <PatientDetail
      patient={patient}
      doctorPatient={doctorPatient}
      template={template}
      allQuestions={allQuestions}
      compliance={compliance}
      trend={trend}
      trendDiff={trendDiff}
      insights={insights}
      checkedInToday={checkedInToday}
      streak={streak}
      totalCheckins={allCheckIns.length}
      monthlyData={monthlyData}
      weeklyData={weeklyData}
      dailyCompliance={dailyCompliance}
      recentCheckins={recentCheckins}
      numericTrends={numericTrends}
      checkinDates={checkinDates}
      lastCheckIn={lastCheckIn}
    />
  );
}
