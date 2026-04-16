"use client";

import type { Patient, DoctorPatient, TrackingTemplate, Trend, CheckIn, TemplateQuestion, Visit } from "@/lib/db/types";
import type { ComplianceScore } from "@/lib/compliance/engine";
import { ProfileCard } from "./detail/profile-card";
import { StatCards } from "./detail/stat-cards";
import { AlertsPanel } from "./detail/alerts-panel";
import { ComplianceChart } from "./detail/compliance-chart";
import { HealthMetrics } from "./detail/health-metrics";
import { CheckinCalendar } from "./detail/checkin-calendar";
import { ComplianceBreakdown } from "./detail/compliance-breakdown";
import { LastCheckinDetail } from "./detail/last-checkin-detail";
import { PersonalInfo } from "./detail/personal-info";
import { MedicalProfile } from "./detail/medical-profile";
import { VisitTracker } from "./detail/visit-tracker";

type PatientDetailProps = {
  patient: Patient;
  doctorPatient: DoctorPatient;
  template: TrackingTemplate;
  allQuestions: TemplateQuestion[];
  compliance: ComplianceScore;
  trend: Trend;
  trendDiff: number;
  insights: string[];
  checkedInToday: boolean;
  streak: number;
  totalCheckins: number;
  monthlyData: { month: string; score: number }[];
  weeklyData: { week: string; score: number }[];
  dailyCompliance: { day: string; date: string; score: number; answered: number; total: number }[];
  numericTrends: { key: string; label: string; unit: string; data: { date: string; value: number }[] }[];
  calendarData: Record<string, { score: number; responses: Record<string, unknown> }>;
  lastCheckIn: CheckIn | null;
  visits: Visit[];
};

export function PatientDetail({
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
  calendarData,
  lastCheckIn,
  visits,
}: PatientDetailProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* ─── LEFT + CENTER (≈2/3) ────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Top section: left sidebar + center content */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Left column — fixed 280px */}
          <div className="flex w-full flex-col gap-4 lg:w-70 lg:shrink-0">
            <ProfileCard patient={patient} doctorPatient={doctorPatient} template={template} />
            <PersonalInfo patient={patient} />
            <MedicalProfile patient={patient} />
          </div>

          {/* Center column — fluid */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <StatCards
              complianceScore={compliance.overall}
              checkedInToday={checkedInToday}
              streak={streak}
              trend={trend}
              trendDiff={trendDiff}
            />
            <AlertsPanel insights={insights} />
            <ComplianceChart
              monthlyData={monthlyData}
              weeklyData={weeklyData}
              dailyCompliance={dailyCompliance}
              overallScore={compliance.overall}
              trend={trend}
              trendDiff={trendDiff}
            />
            <HealthMetrics trends={numericTrends} />
          </div>
        </div>

        {/* Visits — spans full width of left + center (≈2/3 of page) */}
        <VisitTracker visits={visits} doctorPatientId={doctorPatient.id} />
      </div>

      {/* ─── RIGHT COLUMN (≈1/3) ─────────────────────────── */}
      <div className="flex w-full flex-col gap-4 lg:w-70 lg:shrink-0">
        <CheckinCalendar calendarData={calendarData} allQuestions={allQuestions} enabledQuestions={doctorPatient.enabledQuestions} />
        <ComplianceBreakdown metrics={compliance.metrics} allQuestions={allQuestions} />
        <LastCheckinDetail checkIn={lastCheckIn} questions={allQuestions} enabledQuestions={doctorPatient.enabledQuestions} />
      </div>
    </div>
  );
}
