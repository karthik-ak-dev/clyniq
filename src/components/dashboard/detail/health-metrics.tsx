"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type NumericTrend = {
  key: string;
  label: string;
  unit: string;
  data: { date: string; value: number }[];
};

export function HealthMetrics({ trends }: { trends: NumericTrend[] }) {
  return (
    <div className="rounded-xl bg-white p-5">
      <h3 className="text-md font-bold text-black">Health Metrics</h3>
      <p className="mt-0.5 text-base text-dark-grey">Last 14 days</p>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
        {trends.map((t) => {
          const latest = t.data[t.data.length - 1];
          const prev = t.data.length > 1 ? t.data[t.data.length - 2] : null;
          const diff = prev ? latest.value - prev.value : 0;
          const diffSign = diff > 0 ? "+" : "";

          return (
            <div key={t.key} className="rounded-lg bg-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base text-dark-grey">{t.label.replace("?", "").replace("What was your ", "").replace("What's your ", "")}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-black">{latest?.value ?? "—"}</span>
                    <span className="text-base text-dark-grey">{t.unit}</span>
                    {prev && diff !== 0 && (
                      <span className={`text-base font-medium ${diff > 0 ? "text-red" : "text-primary"}`}>
                        {diffSign}{diff}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {t.data.length > 1 && (
                <div className="mt-3" style={{ width: "100%", height: 48 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={t.data}>
                      <XAxis dataKey="date" hide />
                      <Tooltip
                        formatter={(value) => [`${value} ${t.unit}`, ""]}
                        labelFormatter={(label) => {
                          const d = new Date(label + "T00:00:00");
                          return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                        }}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #E5E6E6", fontSize: "11px", padding: "4px 8px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#35BFA3"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3, fill: "#35BFA3" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
