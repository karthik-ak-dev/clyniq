"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageLoader } from "@/components/ui/page-loader";
import { apiFetch } from "@/lib/api-client";
import type { Trend } from "@/lib/db/types";

type PatientRow = {
  patient: { id: string; name: string; phone: string; createdAt: string };
  doctorPatient: { id: string; condition: string; magicToken: string };
  compliance: {
    score: { overall: number };
    trend: Trend;
    insights: string[];
  };
  lastCheckIn: string | null;
};

export default function DashboardHome() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);

  const doctorName = session?.user?.name || "Doctor";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await apiFetch<PatientRow[]>("/api/patients");
        if (data) setPatients(data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchPatients();
  }, []);

  const needsAttention = patients.filter((r) => r.compliance.score.overall < 40);
  const followUp = patients.filter((r) => r.compliance.score.overall >= 40 && r.compliance.score.overall < 70);
  const onTrack = patients.filter((r) => r.compliance.score.overall >= 70);

  const avgCompliance = patients.length > 0
    ? Math.round(patients.reduce((sum, r) => sum + r.compliance.score.overall, 0) / patients.length)
    : 0;

  const totalInsights = patients.reduce((sum, r) => sum + r.compliance.insights.length, 0);

  return (
    <div className="flex flex-col lg:overflow-hidden" style={{ minHeight: "auto" }}>
      {/* Greeting header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[1.5rem] sm:text-[1.6rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>
            {greeting}, {doctorName}
          </h1>
          <p className="text-[0.95rem] mt-0.5" style={{ fontWeight: 400, color: "#8e8aa0" }}>{today}</p>
        </div>
        <div style={{ paddingBottom: "2px", background: "linear-gradient(135deg, #6d28d9, #5b21b6)", borderRadius: "9999px", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}>
            <span className="text-white text-[0.72rem]" style={{ fontWeight: 600 }}>
              {doctorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader message="Loading dashboard..." />
      ) : (
        <div className="flex-1 flex flex-col lg:grid lg:grid-rows-[auto_1fr_auto] gap-3 lg:min-h-0 lg:overflow-hidden">

          {/* Row 1: Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Patients" value={String(patients.length)} icon={<IconStat type="patients" />} />
            <StatCard label="Needs Attention" value={String(needsAttention.length)} icon={<IconStat type="alert" />} color="#dc2626" />
            <StatCard label="Avg. Compliance" value={`${avgCompliance}%`} icon={<IconStat type="chart" />} color={avgCompliance >= 70 ? "#16a34a" : avgCompliance >= 40 ? "#d97706" : "#dc2626"} />
            <StatCard label="Active Insights" value={String(totalInsights)} icon={<IconStat type="warning" />} color={totalInsights > 0 ? "#d97706" : "#16a34a"} />
          </div>

          {/* Row 2: Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:min-h-0 lg:overflow-hidden">
            <div className="lg:col-span-2 flex flex-col lg:grid lg:grid-rows-2 gap-3 lg:min-h-0">
              <PatientSection title="Needs Attention" dotColor="#dc2626" patients={needsAttention} emptyText="All patients are doing well" emptyIcon="check" />
              <PatientSection title="Follow-Up Needed" dotColor="#d97706" patients={followUp} emptyText="No patients need follow-up" emptyIcon="check" />
            </div>

            <div className="flex flex-col lg:grid lg:grid-rows-2 gap-3 lg:min-h-0">
              <PatientSection title="On Track" dotColor="#16a34a" patients={onTrack} emptyText="No patients on track yet" emptyIcon="patients" />

              <Card3D>
                <div className="px-5 pt-5 pb-5 h-full flex flex-col">
                  <h3 className="text-[1rem] mb-4" style={{ fontWeight: 600, color: "#2d2b3d" }}>Quick Actions</h3>
                  <div className="flex-1 flex flex-col justify-center space-y-2.5">
                    <ActionLink href="/patients/add" icon="add" label="Add New Patient" desc="Start tracking a new patient" purple />
                    <ActionLink href="/patients" icon="list" label="View All Patients" desc="See the full patient list" />
                    <ActionLink href="/templates" icon="template" label="Manage Templates" desc="Configure check-in questions" />
                  </div>
                </div>
              </Card3D>
            </div>
          </div>

          {/* Row 3: Footer */}
          <Card3D>
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#ede9f8" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="8" cy="8" r="6.5" /><path d="M8 4.5v3.5l2.5 1.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.95rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>
                    {patients.length === 0 ? "Get started by adding your first patient" : `${patients.length} patient${patients.length !== 1 ? "s" : ""} being tracked`}
                  </p>
                  <p className="text-[0.85rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>
                    {totalInsights === 0 ? "No active insights — all patients are on track" : `${totalInsights} insight${totalInsights !== 1 ? "s" : ""} need your attention`}
                  </p>
                </div>
              </div>
              <Link
                href={patients.length === 0 ? "/patients/add" : "/patients"}
                className="text-[0.92rem] px-4 py-2 rounded-xl transition-all hover:bg-[#ece7f8]"
                style={{ fontWeight: 600, color: "#7c3aed" }}
              >
                {patients.length === 0 ? "Add Patient →" : "View Patients →"}
              </Link>
            </div>
          </Card3D>
        </div>
      )}
    </div>
  );
}

// ─── Patient section ────────────────────────────────────────

function PatientSection({ title, dotColor, patients, emptyText, emptyIcon }: {
  title: string; dotColor: string; patients: PatientRow[]; emptyText: string; emptyIcon: string;
}) {
  return (
    <Card3D>
      <div className="px-5 pt-5 pb-4 h-full flex flex-col min-h-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
            <h3 className="text-[1rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>{title}</h3>
            {patients.length > 0 && (
              <span className="text-[0.78rem] px-2 py-0.5 rounded-full" style={{ fontWeight: 600, color: dotColor, background: `${dotColor}14` }}>
                {patients.length}
              </span>
            )}
          </div>
          <Link href="/patients" className="text-[0.88rem]" style={{ fontWeight: 500, color: "#7c3aed" }}>View All</Link>
        </div>
        {patients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#ede9f8" }}>
              {emptyIcon === "check" ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"><path d="M4 9.5l3.5 3.5 7-8" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="6" r="3.5" /><path d="M1 16c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" /></svg>
              )}
            </div>
            <p className="text-[0.92rem]" style={{ fontWeight: 400, color: "#a8a2bc" }}>{emptyText}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {patients.slice(0, 5).map((row) => (
              <PatientMiniCard key={row.doctorPatient.id} row={row} />
            ))}
            {patients.length > 5 && (
              <Link href="/patients" className="block text-center py-2 text-[0.84rem]" style={{ fontWeight: 500, color: "#7c3aed" }}>
                +{patients.length - 5} more
              </Link>
            )}
          </div>
        )}
      </div>
    </Card3D>
  );
}

// ─── Mini patient card ──────────────────────────────────────

function PatientMiniCard({ row }: { row: PatientRow }) {
  const initials = row.patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const conditionLabel = row.doctorPatient.condition === "diabetes" ? "Diabetes" : "Obesity";
  const score = row.compliance.score.overall;
  const status = score >= 70
    ? { label: "On Track", color: "#16a34a", bg: "rgba(22,163,74,0.08)" }
    : score >= 40
      ? { label: "Moderate", color: "#d97706", bg: "rgba(217,119,6,0.08)" }
      : { label: "High Risk", color: "#dc2626", bg: "rgba(220,38,38,0.08)" };

  return (
    <Link href={`/patients/${row.doctorPatient.id}`} className="block group">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group-hover:bg-[#ece7f8]">
        <div style={{ paddingBottom: "1px", background: "linear-gradient(180deg, #d4cbe6, #c8bedd)", borderRadius: "9999px" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8e2f6, #ddd6ee)" }}>
            <span className="text-[0.68rem] text-[#7c3aed]" style={{ fontWeight: 600 }}>{initials}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[0.95rem] block truncate" style={{ fontWeight: 600, color: "#2d2b3d" }}>{row.patient.name}</span>
          <span className="text-[0.85rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>{conditionLabel}</span>
        </div>
        <span className="text-[0.82rem] px-2.5 py-1 rounded-full shrink-0" style={{ fontWeight: 600, color: status.color, background: status.bg }}>
          {status.label}
        </span>
      </div>
    </Link>
  );
}

// ─── Action link ────────────────────────────────────────────

function ActionLink({ href, icon, label, desc, purple }: { href: string; icon: string; label: string; desc: string; purple?: boolean }) {
  return (
    <Link href={href} className="block group">
      <div
        className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all group-hover:bg-[#ece7f8]"
        style={purple ? {
          background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
          boxShadow: "0 3px 10px rgba(124,58,237,0.2)",
        } : {}}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: purple ? "rgba(255,255,255,0.2)" : "#ede9f8" }}
        >
          {icon === "add" && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={purple ? "white" : "#7c3aed"} strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" /></svg>}
          {icon === "list" && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="5" r="3" /><path d="M1 14c0-3 2.5-4.5 5-4.5s5 1.5 5 4.5" /><circle cx="12" cy="5.5" r="1.5" /><path d="M12 9c1.5 0 2.5 1 2.5 2.5" /></svg>}
          {icon === "template" && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="1.5" width="12" height="13" rx="1.5" /><line x1="5" y1="5.5" x2="11" y2="5.5" /><line x1="5" y1="8.5" x2="11" y2="8.5" /><line x1="5" y1="11.5" x2="8.5" y2="11.5" /></svg>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.95rem]" style={{ fontWeight: 600, color: purple ? "white" : "#2d2b3d" }}>{label}</p>
          <p className="text-[0.82rem]" style={{ fontWeight: 400, color: purple ? "rgba(255,255,255,0.7)" : "#8e8aa0" }}>{desc}</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={purple ? "rgba(255,255,255,0.5)" : "#b0aac2"} strokeWidth="1.5" strokeLinecap="round">
          <path d="M5 3l4 4-4 4" />
        </svg>
      </div>
    </Link>
  );
}

// ─── Stat card ──────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        paddingBottom: "2px",
        background: "linear-gradient(180deg, #ddd6ee 0%, #d6cee6 100%)",
        borderRadius: "0.75rem",
      }}
    >
      <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#f0ecfa" }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#ede9f8" }}>
          {icon}
        </div>
        <div>
          <p className="text-[1.5rem]" style={{ fontWeight: 700, color: color || "#2d2b3d" }}>{value}</p>
          <p className="text-[0.85rem]" style={{ fontWeight: 500, color: "#8e8aa0" }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function IconStat({ type }: { type: "patients" | "alert" | "warning" | "chart" }) {
  const stroke = type === "alert" ? "#dc2626" : type === "warning" ? "#d97706" : "#7c3aed";
  if (type === "patients") return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="5.5" r="3" /><path d="M1.5 16c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="13" cy="6" r="2" /><path d="M13 10c2 0 3.5 1.2 3.5 3.5" />
    </svg>
  );
  if (type === "alert") return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2l7.5 13H1.5L9 2z" /><line x1="9" y1="7" x2="9" y2="10.5" /><circle cx="9" cy="13" r="0.5" fill={stroke} />
    </svg>
  );
  if (type === "warning") return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7" /><line x1="9" y1="6" x2="9" y2="9.5" /><circle cx="9" cy="12" r="0.5" fill={stroke} />
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14l4-5 3 3 5-7" /><path d="M11 5h5v5" />
    </svg>
  );
}

// ─── 3D Card wrapper ────────────────────────────────────────

function Card3D({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        paddingBottom: "2px",
        background: "linear-gradient(180deg, #d4cce4 0%, #cdc4de 100%)",
        borderRadius: "1rem",
        boxShadow: "0 8px 28px rgba(124,58,237,0.07), 0 2px 4px rgba(0,0,0,0.03)",
      }}
    >
      <div className="rounded-2xl overflow-hidden h-full" style={{ background: "#f0ecfa" }}>
        {children}
      </div>
    </div>
  );
}
