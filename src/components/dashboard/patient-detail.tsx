"use client";

import type { Patient, DoctorPatient, TrackingTemplate, Trend, CheckIn, TemplateQuestion } from "@/lib/db/types";
import type { ComplianceScore } from "@/lib/compliance/engine";
import { ProfileCard } from "./detail/profile-card";
import { StatCards } from "./detail/stat-cards";
import { AlertsPanel } from "./detail/alerts-panel";
import { ComplianceChart } from "./detail/compliance-chart";
import { WeeklyActivity } from "./detail/weekly-activity";
import { RecentCheckins } from "./detail/recent-checkins";
import { HealthMetrics } from "./detail/health-metrics";
import { CheckinCalendar } from "./detail/checkin-calendar";
import { ComplianceBreakdown } from "./detail/compliance-breakdown";
import { LastCheckinDetail } from "./detail/last-checkin-detail";
import { PersonalInfo } from "./detail/personal-info";
import { MedicalProfile } from "./detail/medical-profile";

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
  recentCheckins: { date: string; score: number; answered: number; total: number }[];
  numericTrends: { key: string; label: string; unit: string; data: { date: string; value: number }[] }[];
  checkinDates: string[];
  lastCheckIn: CheckIn | null;
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
  totalCheckins,
  monthlyData,
  weeklyData,
  dailyCompliance,
  recentCheckins,
  numericTrends,
  checkinDates,
  lastCheckIn,
}: PatientDetailProps) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_280px]">
      {/* ─── LEFT COLUMN ─────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <ProfileCard patient={patient} doctorPatient={doctorPatient} template={template} />
        <PersonalInfo patient={patient} />
        <MedicalProfile patient={patient} />
      </div>

      {/* ─── CENTER COLUMN ────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <StatCards
          complianceScore={compliance.overall}
          checkedInToday={checkedInToday}
          streak={streak}
          trend={trend}
          trendDiff={trendDiff}
        />
        {insights.length > 0 && <AlertsPanel insights={insights} />}
        <ComplianceChart
          monthlyData={monthlyData}
          weeklyData={weeklyData}
          dailyCompliance={dailyCompliance}
          overallScore={compliance.overall}
          trend={trend}
          trendDiff={trendDiff}
        />
        {numericTrends.length > 0 && <HealthMetrics trends={numericTrends} />}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <WeeklyActivity data={dailyCompliance} />
          <RecentCheckins data={recentCheckins} />
        </div>
      </div>

      {/* ─── RIGHT COLUMN ─────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <CheckinCalendar checkinDates={checkinDates} />
        <ComplianceBreakdown metrics={compliance.metrics} allQuestions={allQuestions} />
        <LastCheckinDetail
          checkIn={lastCheckIn}
          questions={allQuestions}
          enabledQuestions={doctorPatient.enabledQuestions}
        />
      </div>
    </div>
  );
}
