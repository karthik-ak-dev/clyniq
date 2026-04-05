import type { QuestionMetric } from "@/lib/compliance/engine";

// ─── Compliance Summary ────────────────────────────────────
// Per-question horizontal progress bars with fraction labels.
// Matched to design/doc_flow/patient_detail.png.

interface ComplianceSummaryProps {
  overall: number;
  metrics: QuestionMetric[];
}

export function ComplianceSummary({ overall, metrics }: ComplianceSummaryProps) {
  const overallColor =
    overall >= 70 ? "text-green-600" : overall >= 40 ? "text-amber-500" : "text-red-500";

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-700 text-gray-900">Compliance (Last 7 Days)</h3>
        <span className={`text-2xl font-800 ${overallColor}`}>{overall}%</span>
      </div>

      {metrics.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet</p>
      ) : (
        <div className="space-y-3">
          {metrics.map((m) => (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 truncate pr-2">
                  {m.label}
                </span>
                <span className="text-xs font-600 text-gray-500 shrink-0">
                  {m.done}/{m.total}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${m.percentage}%`,
                    background:
                      m.percentage >= 70
                        ? "#22c55e"
                        : m.percentage >= 40
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
