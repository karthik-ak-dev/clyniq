"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { NumericTrend } from "@/lib/db/types";
import { cleanMetricLabel } from "@/lib/utils/format-helpers";

export function HealthMetrics({ trends }: { trends: NumericTrend[] }) {
  return (
    <div className="flex h-64 flex-col rounded-xl bg-white p-5 min-w-0">
      <h3 className="text-2xl font-bold text-black tracking-tighter shrink-0">Health Metrics</h3>
      <p className="mt-1 text-md text-dark-grey shrink-0">Last 14 days</p>

      {trends.length === 0 ? (
        <p className="mt-4 text-md text-dark-grey">No numeric metrics tracked for this patient.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 overflow-y-auto min-h-0">
          {trends.map((t) => {
            const diffSign = t.diff > 0 ? "+" : "";

            return (
              <div key={t.key} className="rounded-lg bg-surface p-4">
                <p className="text-md font-medium text-dark-grey capitalize">{cleanMetricLabel(t.label)}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-black">{t.latestValue ?? "\u2014"}</span>
                  <span className="text-base text-dark-grey">{t.unit}</span>
                  {t.diff !== 0 && (
                    <span className={`text-base font-medium ${t.diff > 0 ? "text-red" : "text-primary"}`}>
                      {diffSign}{t.diff}
                    </span>
                  )}
                </div>

                {t.data.length > 1 && (
                  <div className="mt-3" style={{ width: "100%", height: 48 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={t.data}>
                        <XAxis dataKey="date" hide />
                        <Tooltip
                          formatter={(value) => [`${value} ${t.unit}`, ""]}
                          labelFormatter={(l) => {
                            const d = new Date(l + "T00:00:00");
                            return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                          }}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #E5E6E6", fontSize: "11px", padding: "4px 8px" }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#35BFA3" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: "#35BFA3" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
