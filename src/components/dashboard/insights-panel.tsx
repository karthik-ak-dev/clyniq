// ─── Insights Panel ─────────────────────────────────────────
// Polished insight flags with layered card.

interface InsightsPanelProps {
  insights: string[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{
        boxShadow: "0 2px 0 rgba(139,92,246,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid rgba(139,92,246,0.06)",
      }}
    >
      <h3 className="font-800 text-gray-900 mb-4">Insights</h3>

      {insights.length === 0 ? (
        <div
          className="px-4 py-3 rounded-xl text-[0.875rem] font-600 flex items-center gap-2"
          style={{ background: "#ecfdf5", color: "#059669" }}
        >
          ✅ Everything looks good this week!
        </div>
      ) : (
        <div className="space-y-2.5">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 rounded-xl text-[0.875rem]"
              style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
            >
              <span className="shrink-0">⚠️</span>
              <span className="text-gray-700 font-500">{insight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
