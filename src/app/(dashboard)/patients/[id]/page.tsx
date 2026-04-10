"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { apiFetch } from "@/lib/api-client";
import type { Trend } from "@/lib/db/types";
import type { QuestionMetric } from "@/lib/compliance/engine";

type PatientDetail = {
  patient: { name: string; phone: string; email: string | null; age: number | null; gender: string | null; createdAt: string };
  doctorPatient: { id: string; condition: string; magicToken: string; enabledQuestions: string[] };
  template: { questions: { key: string; label: string; type: string }[] } | null;
  compliance: {
    score: { overall: number; metrics: QuestionMetric[] };
    trend: Trend;
    insights: string[];
  };
  recentCheckIns: { date: string; responses: Record<string, boolean | number | string | string[]> }[];
};

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"overview" | "history" | "notes">("overview");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const result = await apiFetch<PatientDetail>(`/api/patients/${params.id}`);
        if (result) setData(result);
      } catch { /* handled by null */ }
      finally { setLoading(false); }
    }
    fetchDetail();
  }, [params.id]);

  const copyMagicLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(`${window.location.origin}/p/${data.doctorPatient.magicToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Patient Detail" />
        <PageLoader message="Loading patient..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Patient Detail" />
        <Card3D>
          <div className="text-center py-16">
            <p className="text-[0.92rem] mb-3" style={{ fontWeight: 500, color: "#8e8aa0" }}>Patient not found</p>
            <button onClick={() => router.back()} className="text-[0.9rem]" style={{ fontWeight: 600, color: "#7c3aed" }}>
              ← Go back
            </button>
          </div>
        </Card3D>
      </div>
    );
  }

  const { patient, doctorPatient, compliance, recentCheckIns } = data;
  const initials = patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const sinceDate = new Date(patient.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const conditionLabel = doctorPatient.condition === "diabetes" ? "Diabetes" : "Obesity";
  const lastCheckIn = recentCheckIns.length > 0 ? recentCheckIns[recentCheckIns.length - 1] : null;
  const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : null;

  const overallColor = compliance.score.overall >= 70 ? "#16a34a" : compliance.score.overall >= 40 ? "#d97706" : "#dc2626";
  const overallBg = compliance.score.overall >= 70 ? "rgba(22,163,74,0.08)" : compliance.score.overall >= 40 ? "rgba(217,119,6,0.08)" : "rgba(220,38,38,0.08)";

  const trendConfig = {
    improving: { label: "Improving", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
    stable: { label: "Stable", color: "#8e8aa0", bg: "#eae5f6" },
    worsening: { label: "Worsening", color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  }[compliance.trend];

  // Summarize key stats from last check-in
  const summaryItems: { label: string; value: string }[] = [];
  if (lastCheckInDate) summaryItems.push({ label: "Last check-in", value: lastCheckInDate });
  if (lastCheckIn) {
    for (const [key, val] of Object.entries(lastCheckIn.responses)) {
      if (typeof val === "boolean") {
        const q = data.template?.questions.find((q) => q.key === key);
        if (q) summaryItems.push({ label: q.label.replace(/\?$/, "").replace(/^Did you /, "").replace(/^How was your /, ""), value: val ? "Yes" : "No" });
      } else if (typeof val === "number") {
        const q = data.template?.questions.find((q) => q.key === key);
        if (q) summaryItems.push({ label: q.label.replace(/\?$/, "").replace(/^What was your /, "").replace(/^What's your /, ""), value: String(val) });
      } else if (typeof val === "string") {
        const q = data.template?.questions.find((q) => q.key === key);
        if (q) summaryItems.push({ label: q.label.replace(/\?$/, "").replace(/^How was your /, "").replace(/^How are you /, ""), value: val });
      }
    }
  }

  return (
    <div>
      <PageHeader title="Patient Detail" />

      {/* Main card */}
      <Card3D>
        {/* ─── Patient Header ─── */}
        <div className="px-6 pt-6 pb-0 sm:px-8">
          <div className="flex items-center gap-4 mb-5">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all hover:bg-[#ece7f8]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>

            {/* Avatar — 3D */}
            <div style={{ paddingBottom: "2px", background: "linear-gradient(180deg, #d4cbe6, #c8bedd)", borderRadius: "9999px" }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #e8e2f6, #ddd6ee)" }}
              >
                <span className="text-base text-[#7c3aed]" style={{ fontWeight: 700 }}>{initials}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[1.25rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>{patient.name}</h2>
                <span className="px-2.5 py-0.5 rounded-lg text-[0.78rem]" style={{ fontWeight: 600, color: "#7c3aed", background: "#ede9f8" }}>
                  {conditionLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[0.78rem]" style={{ fontWeight: 600, color: trendConfig.color, background: trendConfig.bg }}>
                  {trendConfig.label}
                </span>
              </div>
              <p className="text-[0.8rem] mt-0.5" style={{ fontWeight: 400, color: "#8e8aa0" }}>
                {[
                  patient.age && `${patient.age}y`,
                  patient.gender && patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1),
                  patient.phone,
                  patient.email,
                ].filter(Boolean).join(" · ")} · Since {sinceDate}
              </p>
            </div>

            {/* Copy Link */}
            <Btn3DOutline onClick={copyMagicLink}>
              {copied ? "Copied!" : "Copy Link"}
            </Btn3DOutline>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {(["overview", "history", "notes"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 rounded-t-lg text-[0.9rem] transition-all"
                style={{
                  fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? "#7c3aed" : "#8e8aa0",
                  background: tab === t ? "#f6f3fc" : "transparent",
                  borderBottom: tab === t ? "2px solid #7c3aed" : "2px solid transparent",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e0daf0" }}>
          {tab === "overview" && (
            <div className="px-5 py-5 sm:px-6">
              {/* Row 1: Summary + Recent Check-ins */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Summary */}
                <Section3D>
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3l2 1.5" />
                    </svg>
                    <h3 className="text-[1.05rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>Summary</h3>
                  </div>
                  {summaryItems.length === 0 ? (
                    <p className="text-[0.9rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>No check-in data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {summaryItems.slice(0, 6).map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#7c3aed" }} />
                          <span className="text-[0.9rem]" style={{ fontWeight: 400, color: "#5a5773" }}>
                            {item.label}: <span style={{ fontWeight: 600, color: "#2d2b3d" }}>{item.value}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section3D>

                {/* Recent Check-ins — date list */}
                <Section3D>
                  <h3 className="text-[1.05rem] mb-4" style={{ fontWeight: 600, color: "#2d2b3d" }}>Recent Check-ins</h3>
                  {recentCheckIns.length === 0 ? (
                    <p className="text-[0.9rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>No check-ins yet</p>
                  ) : (
                    <div className="space-y-2.5">
                      {recentCheckIns.slice(-5).reverse().map((ci) => {
                        const d = new Date(ci.date + "T12:00:00");
                        const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                        const yesCount = Object.values(ci.responses).filter((v) => v === true).length;
                        const totalScored = Object.values(ci.responses).filter((v) => typeof v === "boolean").length;
                        const pct = totalScored > 0 ? Math.round((yesCount / totalScored) * 100) : 0;
                        const pctColor = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
                        return (
                          <div key={ci.date} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(124,58,237,0.08)" }}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>
                            </div>
                            <span className="text-[0.9rem] flex-1" style={{ fontWeight: 500, color: "#2d2b3d" }}>{dateStr}</span>
                            <span className="text-[0.9rem]" style={{ fontWeight: 700, color: pctColor }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Section3D>
              </div>

              {/* Row 2: Compliance */}
              <div className="mb-4">
                <Section3D>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[1.05rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>Compliance Last 7 Days</h3>
                    {/* Big score circle */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: overallBg,
                        boxShadow: `0 0 0 3px ${overallBg}`,
                      }}
                    >
                      <span className="text-base" style={{ fontWeight: 700, color: overallColor }}>{compliance.score.overall}%</span>
                    </div>
                  </div>

                  {compliance.score.metrics.length === 0 ? (
                    <p className="text-[0.9rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>No data yet — waiting for check-ins</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {compliance.score.metrics.map((m) => {
                        const barColor = m.percentage >= 70 ? "#8b5cf6" : m.percentage >= 40 ? "#d97706" : "#dc2626";
                        return (
                          <div key={m.key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[0.8rem] truncate pr-3" style={{ fontWeight: 500, color: "#2d2b3d" }}>{m.label}</span>
                              <span className="text-[0.78rem] shrink-0" style={{ fontWeight: 600, color: "#8e8aa0" }}>{m.done}/{m.total}</span>
                            </div>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#e8e3f4" }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${m.percentage}%`,
                                  background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                                  boxShadow: m.percentage > 0 ? `0 1px 3px ${barColor}40` : "none",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Section3D>
              </div>

              {/* Row 3: Insights + Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Insights — 2 cols */}
                <div className="lg:col-span-2">
                  <Section3D>
                    <h3 className="text-[1.05rem] mb-4" style={{ fontWeight: 600, color: "#2d2b3d" }}>Insights</h3>
                    {compliance.insights.length === 0 ? (
                      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[0.9rem]" style={{ fontWeight: 500, color: "#16a34a", background: "rgba(22,163,74,0.06)" }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><path d="M4.5 7.5l2 2 3-4" /></svg>
                        Everything looks good this week!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {compliance.insights.map((insight, i) => (
                          <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-[0.9rem]" style={{ fontWeight: 500, color: "#d97706", background: "rgba(217,119,6,0.06)" }}>
                            <svg className="shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M7 1l6 11H1L7 1z" /><line x1="7" y1="5.5" x2="7" y2="8" /><circle cx="7" cy="10" r="0.5" fill="#d97706" />
                            </svg>
                            {insight}
                          </div>
                        ))}
                      </div>
                    )}
                  </Section3D>
                </div>

                {/* Quick Actions — 1 col */}
                <Section3D>
                  <h3 className="text-[1.05rem] mb-4" style={{ fontWeight: 600, color: "#2d2b3d" }}>Quick Actions</h3>
                  <div className="space-y-2.5">
                    <Btn3DOutline onClick={copyMagicLink} full>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" />
                        <path d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" />
                      </svg>
                      {copied ? "Copied!" : "Copy Check-in Link"}
                    </Btn3DOutline>
                  </div>
                </Section3D>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
              <p className="text-[1.05rem]" style={{ fontWeight: 500, color: "#8e8aa0" }}>Check-in history coming soon</p>
            </div>
          )}

          {tab === "notes" && (
            <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
              <p className="text-[1.05rem]" style={{ fontWeight: 500, color: "#8e8aa0" }}>Notes coming soon</p>
            </div>
          )}
        </div>
      </Card3D>
    </div>
  );
}

// ─── Reusable 3D wrappers ───────────────────────────────────

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
      <div className="rounded-2xl overflow-hidden" style={{ background: "#f0ecfa" }}>
        {children}
      </div>
    </div>
  );
}

function Section3D({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "1px 1px 3px 1px",
        background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
        borderRadius: "0.75rem",
        boxShadow: "0 3px 10px rgba(124,58,237,0.06)",
      }}
    >
      <div className="rounded-xl p-5 h-full" style={{ background: "#f6f3fc" }}>
        {children}
      </div>
    </div>
  );
}

function Btn3DOutline({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return (
    <div style={{
      padding: "1px 1px 3px 1px",
      background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
      borderRadius: "0.75rem",
    }}>
      <button
        onClick={onClick}
        className={`${full ? "w-full" : ""} flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[0.9rem] transition-all active:scale-[0.98]`}
        style={{ fontWeight: 600, color: "#7c3aed", background: "#f6f3fc" }}
      >
        {children}
      </button>
    </div>
  );
}
