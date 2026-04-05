// ─── Activity Timeline ──────────────────────────────────────
// Last 7 days grid showing daily check-in status.
// Matched to design/doc_flow/patient_detail.png.

interface CheckInDay {
  date: string; // YYYY-MM-DD
  responses: Record<string, boolean | number | string | string[]>;
}

interface ActivityTimelineProps {
  checkIns: CheckInDay[];
}

export function ActivityTimeline({ checkIns }: ActivityTimelineProps) {
  // Build last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const checkInMap = new Map(checkIns.map((c) => [c.date, c]));

  return (
    <div className="card p-5">
      <h3 className="font-700 text-gray-900 mb-4">Recent Check-ins</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isToday = day === new Date().toISOString().split("T")[0];
          const checkIn = checkInMap.get(day);
          const dayLabel = new Date(day).toLocaleDateString("en-US", {
            weekday: "short",
          });

          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 font-500">
                {dayLabel}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  checkIn
                    ? "bg-green-100 text-green-600"
                    : isToday
                      ? "bg-gray-100 text-gray-400 border border-dashed border-gray-300"
                      : "bg-red-50 text-red-400"
                }`}
              >
                {checkIn ? "✓" : isToday ? "—" : "✗"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
