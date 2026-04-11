import type { QuestionMetric } from "@/lib/compliance/engine";
import type { TemplateQuestion } from "@/lib/db/types";

// Categorize questions by their likely purpose
function categorize(key: string, label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("medicine") || lower.includes("insulin") || lower.includes("medication")) return "Medication";
  if (lower.includes("diet") || lower.includes("exercise") || lower.includes("water") || lower.includes("snack") || lower.includes("portion") || lower.includes("alcohol") || lower.includes("sleep") || lower.includes("sugary")) return "Lifestyle";
  if (lower.includes("blood sugar") || lower.includes("weight") || lower.includes("pressure") || lower.includes("feet") || lower.includes("foot") || lower.includes("monitor")) return "Monitoring";
  return "Other";
}

export function ComplianceBreakdown({ metrics, allQuestions }: {
  metrics: QuestionMetric[];
  allQuestions: TemplateQuestion[];
}) {
  if (metrics.length === 0) {
    return (
      <div className="rounded-xl bg-white p-5">
        <h3 className="text-md font-bold text-black">Compliance Breakdown</h3>
        <p className="mt-3 text-md text-dark-grey">No compliance data yet.</p>
      </div>
    );
  }

  // Group metrics by category
  const groups: Record<string, QuestionMetric[]> = {};
  for (const m of metrics) {
    const cat = categorize(m.key, m.label);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(m);
  }

  const categoryOrder = ["Medication", "Lifestyle", "Monitoring", "Other"];
  const sortedGroups = categoryOrder
    .filter((cat) => groups[cat]?.length)
    .map((cat) => ({ category: cat, items: groups[cat] }));

  return (
    <div className="rounded-xl bg-white p-5">
      <h3 className="text-md font-bold text-black">Compliance Breakdown</h3>
      <p className="mt-0.5 text-base text-dark-grey">Last 7 days</p>

      <div className="mt-4 flex flex-col gap-5">
        {sortedGroups.map(({ category, items }) => (
          <div key={category}>
            <p className="text-base font-semibold text-dark-grey uppercase tracking-wide mb-2">{category}</p>
            <div className="flex flex-col gap-3">
              {items.map((m) => {
                const barColor = m.percentage >= 80 ? "bg-primary" : m.percentage >= 50 ? "bg-yellow" : "bg-red";
                return (
                  <div key={m.key}>
                    <div className="flex items-center justify-between text-md mb-1">
                      <span className="text-black truncate pr-2">{m.label.replace("Did you ", "").replace(" today?", "").replace("?", "")}</span>
                      <span className="shrink-0 font-medium text-black">{m.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-primary-light">
                      <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${m.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
