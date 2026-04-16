import type { ComplianceGroup } from "@/lib/db/types";
import { shortQuestionLabel } from "@/lib/utils/format-helpers";

export function ComplianceBreakdown({ groups }: {
  groups: ComplianceGroup[];
}) {
  if (groups.length === 0) {
    return (
      <div className="flex h-140 flex-col rounded-xl bg-white p-5">
        <h3 className="text-2xl font-bold text-black tracking-tighter">Compliance Breakdown</h3>
        <p className="mt-1 text-md text-dark-grey">Last 7 days</p>
        <p className="mt-4 text-md text-dark-grey">No compliance data yet.</p>
      </div>
    );
  }

  return (
    <div className="flex h-140 flex-col rounded-xl bg-white p-5">
      <h3 className="text-2xl font-bold text-black tracking-tighter shrink-0">Compliance Breakdown</h3>
      <p className="mt-1 text-md text-dark-grey shrink-0">Last 7 days</p>

      <div className="mt-3 flex flex-col gap-4 overflow-y-auto min-h-0">
        {groups.map(({ category, items }) => (
          <div key={category}>
            <p className="text-md font-bold text-primary-dark mb-2">{category}</p>
            <div className="flex flex-col gap-2">
              {items.map((m) => {
                const barColor = m.percentage >= 80 ? "bg-primary" : m.percentage >= 50 ? "bg-yellow" : m.percentage > 0 ? "bg-red" : "bg-border";

                return (
                  <div key={m.key} className="flex items-center gap-2">
                    <span className="flex-1 text-md text-black truncate">
                      {shortQuestionLabel(m.label)}
                    </span>
                    <div className="w-16 shrink-0 h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${Math.max(m.percentage, 2)}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-base font-medium text-black">{m.percentage}%</span>
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
