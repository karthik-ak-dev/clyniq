"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { Trend } from "@/lib/db/types";

type Period = "week" | "month" | "6months";

const PERIOD_LABELS: Record<Period, string> = {
  week: "This Week",
  month: "This Month",
  "6months": "6 Months",
};

export function ComplianceChart({ monthlyData, weeklyData, dailyCompliance, overallScore, trend, trendDiff }: {
  monthlyData: { month: string; score: number }[];
  weeklyData: { week: string; score: number }[];
  dailyCompliance: { day: string; score: number }[];
  overallScore: number;
  trend: Trend;
  trendDiff: number;
}) {
  const [period, setPeriod] = useState<Period>("week");

  const chartData = period === "week"
    ? dailyCompliance.map((d) => ({ name: d.day, score: d.score }))
    : period === "month"
      ? weeklyData.map((d) => ({ name: d.week, score: d.score }))
      : monthlyData.map((d) => ({ name: d.month, score: d.score }));

  const trendSign = trendDiff > 0 ? "+" : "";
  const trendColor = trend === "improving" ? "bg-primary-light text-primary-dark" : trend === "stable" ? "bg-yellow-subtle text-yellow" : "bg-red-subtle text-red";

  return (
    <div className="rounded-xl bg-white p-5 min-w-0">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black tracking-tighter">Compliance Overview</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-black">{overallScore}%</span>
            <span className={`rounded-md px-2 py-0.5 text-base font-medium ${trendColor}`}>
              {trendSign}{trendDiff}%
            </span>
          </div>
        </div>

        {/* Period toggle */}
        <div className="flex rounded-md bg-surface p-0.5">
          {(["week", "month", "6months"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2.5 py-1.5 text-base font-medium transition-colors ${
                period === p ? "bg-white text-black shadow-sm" : "text-dark-grey hover:text-black"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5" style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={period === "6months" ? 32 : period === "month" ? 40 : 28}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#63716E" }} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#63716E" }} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(value) => [`${value}%`, "Compliance"]} contentStyle={{ borderRadius: "8px", border: "1px solid #E5E6E6", fontSize: "12px" }} />
            <Bar dataKey="score" fill="#35BFA3" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
