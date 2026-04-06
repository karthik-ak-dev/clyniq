// ─── Activity Timeline ──────────────────────────────────────
// Polished 7-day check-in grid with layered card.

interface CheckInDay {
  date: string;
  responses: Record<string, boolean | number | string | string[]>;
}

interface ActivityTimelineProps {
  checkIns: CheckInDay[];
}

export function ActivityTimeline({ checkIns }: ActivityTimelineProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const checkInMap = new Map(checkIns.map((c) => [c.date, c]));
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{
        boxShadow: "0 2px 0 rgba(139,92,246,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid rgba(139,92,246,0.06)",
      }}
    >
      <h3 className="font-800 text-gray-900 mb-4">Recent Check-ins</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isToday = day === todayStr;
          const checkIn = checkInMap.get(day);
          const dayLabel = new Date(day).toLocaleDateString("en-US", { weekday: "short" });
          const dateNum = new Date(day).getDate();

          return (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span className="text-[0.65rem] text-gray-400 font-600 uppercase">{dayLabel}</span>
              <div
                className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[0.7rem] font-700"
                style={
                  checkIn
                    ? { background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }
                    : isToday
                      ? { background: "#f5f3ff", color: "#7c3aed", border: "1.5px dashed #c4b5fd" }
                      : { background: "#fef2f2", color: "#f87171", border: "1px solid #fecaca" }
                }
              >
                <span>{checkIn ? "✓" : isToday ? dateNum : "✗"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
