"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

export function WeeklyActivity({ data }: {
  data: { day: string; date: string; score: number; answered: number; total: number }[];
}) {
  const totalAnswered = data.reduce((sum, d) => sum + d.answered, 0);
  const totalPossible = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="rounded-xl bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-black tracking-tighter">Daily Compliance</h3>
        <span className="rounded-md bg-primary-light px-2 py-0.5 text-base font-medium text-primary-dark">This Week</span>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-black">{totalAnswered}</span>
        <span className="text-md text-dark-grey">/ {totalPossible} responses</span>
      </div>

      <div className="mt-4" style={{ width: "100%", height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#63716E" }} />
            <Tooltip
              formatter={(value, _name, props) => {
                const item = props.payload;
                return [`${value}% (${item.answered}/${item.total})`, "Compliance"];
              }}
              contentStyle={{ borderRadius: "8px", border: "1px solid #E5E6E6", fontSize: "12px" }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.score > 0 ? "#35BFA3" : "#E5E6E6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
