import type { QuestionMetric } from "@/lib/compliance/engine";

// ─── Compliance Summary ────────────────────────────────────
// Polished progress bars with layered card style.

interface ComplianceSummaryProps {
  overall: number;
  metrics: QuestionMetric[];
}

export function ComplianceSummary({ overall, metrics }: ComplianceSummaryProps) {
  const overallColor = overall >= 70 ? "#059669" : overall >= 40 ? "#d97706" : "#dc2626";
  const overallBg = overall >= 70 ? "#ecfdf5" : overall >= 40 ? "#fffbeb" : "#fef2f2";

  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{
        boxShadow: "0 2px 0 rgba(139,92,246,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid rgba(139,92,246,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-800 text-gray-900">Compliance (Last 7 Days)</h3>
        <span
          className="px-3.5 py-1.5 rounded-xl text-[0.85rem] font-800"
          style={{ background: overallBg, color: overallColor }}
        >
          {overall}%
        </span>
      </div>

      {metrics.length === 0 ? (
        <p className="text-[0.875rem] text-gray-400 font-500">No data yet — waiting for check-ins</p>
      ) : (
        <div className="space-y-4">
          {metrics.map((m) => {
            const barColor = m.percentage >= 70 ? "#8b5cf6" : m.percentage >= 40 ? "#f59e0b" : "#ef4444";
            return (
              <div key={m.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.85rem] text-gray-600 font-600 truncate pr-3">{m.label}</span>
                  <span className="text-[0.8rem] font-700 text-gray-400 shrink-0">{m.done}/{m.total}</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
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
    </div>
  );
}
