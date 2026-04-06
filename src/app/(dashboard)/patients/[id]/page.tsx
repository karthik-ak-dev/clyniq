"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ComplianceSummary } from "@/components/dashboard/compliance-summary";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { apiFetch } from "@/lib/api-client";
import type { Trend } from "@/lib/db/types";
import type { QuestionMetric } from "@/lib/compliance/engine";

// ─── Patient Detail Page ───────────────────────────────────
// Polished with layered cards, consistent depth effects.

type PatientDetail = {
  patient: { name: string; phone: string; createdAt: string };
  doctorPatient: { id: string; condition: string; magicToken: string };
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

  if (loading) return <div className="text-center py-16 text-gray-400 font-500">Loading...</div>;

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-base mb-3 font-500">Patient not found</p>
        <button onClick={() => router.back()} className="text-[#7c3aed] font-700 text-sm">← Go back</button>
      </div>
    );
  }

  const { patient, doctorPatient, compliance, recentCheckIns } = data;
  const initials = patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const sinceDate = new Date(patient.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const condStyle = doctorPatient.condition === "diabetes"
    ? { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe" }
    : { bg: "#fdf2f8", text: "#db2777", border: "#fbcfe8" };

  const trendConfig = {
    improving: { icon: "↑", label: "Improving", color: "#059669", bg: "#ecfdf5" },
    stable: { icon: "→", label: "Stable", color: "#6b7280", bg: "#f3f4f6" },
    worsening: { icon: "↓", label: "Worsening", color: "#dc2626", bg: "#fef2f2" },
  }[compliance.trend];

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <button onClick={() => router.back()} className="text-[0.85rem] text-[#7c3aed] font-700 mb-5 flex items-center gap-1.5 hover:gap-2.5 transition-all">
        ← Back
      </button>

      {/* Patient header card */}
      <div
        className="bg-white rounded-2xl p-6 mb-5"
        style={{
          boxShadow: "0 2px 0 rgba(139,92,246,0.06), 0 4px 16px rgba(0,0,0,0.04)",
          border: "1px solid rgba(139,92,246,0.06)",
        }}
      >
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
              boxShadow: "0 3px 8px rgba(139,92,246,0.15)",
            }}
          >
            <span className="text-xl font-800 text-[#7c3aed]">{initials}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-800 text-gray-900">{patient.name}</h2>
              <span
                className="px-3 py-1 rounded-lg text-[0.75rem] font-700"
                style={{ background: condStyle.bg, color: condStyle.text, border: `1px solid ${condStyle.border}` }}
              >
                {doctorPatient.condition === "diabetes" ? "Diabetes" : "Obesity"}
              </span>
              <span
                className="px-3 py-1 rounded-lg text-[0.75rem] font-700 flex items-center gap-1"
                style={{ background: trendConfig.bg, color: trendConfig.color }}
              >
                {trendConfig.icon} {trendConfig.label}
              </span>
            </div>
            <p className="text-[0.85rem] text-gray-400 mt-1 font-500">{patient.phone} · Since {sinceDate}</p>
          </div>
        </div>

        {/* Magic link */}
        <div className="mt-5 pt-5 flex items-center gap-3" style={{ borderTop: "1px solid rgba(139,92,246,0.06)" }}>
          <input
            readOnly
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${doctorPatient.magicToken}`}
            className="flex-1 px-3.5 py-2.5 rounded-xl text-[0.8rem] font-500 text-gray-500 bg-gray-50 outline-none truncate"
            style={{ border: "1.5px solid rgba(139,92,246,0.08)" }}
          />
          <button
            onClick={copyMagicLink}
            className="px-4 py-2.5 rounded-xl text-[0.8rem] font-700 shrink-0 transition-all"
            style={{
              background: copied ? "#ecfdf5" : "white",
              color: copied ? "#059669" : "#7c3aed",
              border: `1.5px solid ${copied ? "#a7f3d0" : "rgba(139,92,246,0.15)"}`,
              boxShadow: "0 1px 0 rgba(139,92,246,0.04)",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Grid layout for detail sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <ComplianceSummary overall={compliance.score.overall} metrics={compliance.score.metrics} />
        </div>
        <ActivityTimeline checkIns={recentCheckIns} />
        <InsightsPanel insights={compliance.insights} />
      </div>
    </div>
  );
}
