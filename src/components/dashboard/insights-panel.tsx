// ─── Insights Panel ─────────────────────────────────────────
// List of auto-generated rule-based flags from the compliance engine.
// Matched to design/doc_flow/patient_detail.png.

interface InsightsPanelProps {
  insights: string[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="font-700 text-gray-900 mb-3">Insights</h3>
        <p className="text-sm text-green-600 font-500">
          ✅ Everything looks good this week!
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-700 text-gray-900 mb-3">Insights</h3>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-sm"
          >
            <span className="text-amber-500 shrink-0">⚠️</span>
            <span className="text-gray-700">{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
