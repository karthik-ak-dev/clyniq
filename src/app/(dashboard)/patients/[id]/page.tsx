"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ComplianceSummary } from "@/components/dashboard/compliance-summary";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import type { Trend } from "@/lib/db/types";
import type { QuestionMetric } from "@/lib/compliance/engine";

// ─── Patient Detail Page ───────────────────────────────────
// THE key screen — compliance summary, trend, insights, timeline.
// Matched to design/doc_flow/patient_detail.png.

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
        const res = await fetch(`/api/patients/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch {
        // Error state handled by null data
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [params.id]);

  const copyMagicLink = () => {
    if (!data) return;
    const url = `${window.location.origin}/p/${data.doctorPatient.magicToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Patient not found</p>
        <button onClick={() => router.back()} className="text-[#7c3aed] font-600 text-sm mt-2">
          ← Go back
        </button>
      </div>
    );
  }

  const { patient, doctorPatient, compliance, recentCheckIns } = data;
  const conditionBadge = doctorPatient.condition === "diabetes" ? "badge-diabetes" : "badge-obesity";
  const conditionLabel = doctorPatient.condition === "diabetes" ? "Diabetes" : "Obesity";

  // Avatar initials
  const initials = patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  // Format "Since" date
  const sinceDate = new Date(patient.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-[#7c3aed] font-600 mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Patient header */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#ede9fe] flex items-center justify-center shrink-0">
            <span className="text-lg font-700 text-[#7c3aed]">{initials}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-800 text-gray-900">{patient.name}</h2>
              <span className={conditionBadge}>{conditionLabel}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Since {sinceDate}</p>
          </div>
          <TrendIndicator trend={compliance.trend} />
        </div>

        {/* Magic link */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
          <input
            readOnly
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${doctorPatient.magicToken}`}
            className="input-field text-xs flex-1 bg-gray-50"
          />
          <button onClick={copyMagicLink} className="btn-outline text-xs shrink-0">
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Compliance */}
      <div className="mb-4">
        <ComplianceSummary
          overall={compliance.score.overall}
          metrics={compliance.score.metrics}
        />
      </div>

      {/* Activity Timeline */}
      <div className="mb-4">
        <ActivityTimeline checkIns={recentCheckIns} />
      </div>

      {/* Insights */}
      <div className="mb-4">
        <InsightsPanel insights={compliance.insights} />
      </div>
    </div>
  );
}
