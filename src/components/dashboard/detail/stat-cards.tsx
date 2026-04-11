import type { Trend } from "@/lib/db/types";

function CircularProgress({ value, size = 56, strokeWidth = 4, color = "#35BFA3", children }: {
  value: number; size?: number; strokeWidth?: number; color?: string; children: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E4F2D3" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  );
}

export function StatCards({ complianceScore, checkedInToday, streak, trend, trendDiff }: {
  complianceScore: number;
  checkedInToday: boolean;
  streak: number;
  trend: Trend;
  trendDiff: number;
}) {
  const trendColor = trend === "improving" ? "#35BFA3" : trend === "stable" ? "#F8C947" : "#E63D4B";
  const trendLabel = trend === "improving" ? "Improving" : trend === "stable" ? "Stable" : "Worsening";
  const trendSign = trendDiff > 0 ? "+" : "";

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* Today */}
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-4">
        <CircularProgress value={checkedInToday ? 100 : 0} color={checkedInToday ? "#35BFA3" : "#E5E6E6"}>
          {checkedInToday ? (
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none"><path d="M11.667 3.5L5.25 9.917 2.333 7" stroke="#35BFA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M10 4L4 10M4 4l6 6" stroke="#E5E6E6" strokeWidth="2" strokeLinecap="round"/></svg>
          )}
        </CircularProgress>
        <div className="text-center">
          <p className="text-md font-bold text-black">Today</p>
          <p className="text-base text-dark-grey">{checkedInToday ? "Checked in" : "Not yet"}</p>
        </div>
      </div>

      {/* Weekly Compliance */}
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-4">
        <CircularProgress value={complianceScore}>
          <span className="text-lg font-bold text-black">{complianceScore}%</span>
        </CircularProgress>
        <div className="text-center">
          <p className="text-md font-bold text-black">Weekly</p>
          <p className="text-base text-dark-grey">Compliance</p>
        </div>
      </div>

      {/* Streak */}
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-4">
        <CircularProgress value={Math.min(streak * 14, 100)}>
          <span className="text-lg font-bold text-black">{streak}</span>
        </CircularProgress>
        <div className="text-center">
          <p className="text-md font-bold text-black">Streak</p>
          <p className="text-base text-dark-grey">{streak === 1 ? "day" : "days"}</p>
        </div>
      </div>

      {/* Trend */}
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-4">
        <CircularProgress value={trend === "improving" ? 85 : trend === "stable" ? 50 : 25} color={trendColor}>
          <span className="text-lg font-bold" style={{ color: trendColor }}>
            {trend === "improving" ? "↑" : trend === "stable" ? "→" : "↓"}
          </span>
        </CircularProgress>
        <div className="text-center">
          <p className="text-md font-bold text-black">{trendLabel}</p>
          <p className="text-base text-dark-grey">{trendSign}{trendDiff}% vs last wk</p>
        </div>
      </div>
    </div>
  );
}
