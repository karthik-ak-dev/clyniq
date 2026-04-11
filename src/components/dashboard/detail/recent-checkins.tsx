export function RecentCheckins({ data }: {
  data: { date: string; score: number; answered: number; total: number }[];
}) {
  return (
    <div className="rounded-xl bg-white p-5">
      <h3 className="text-md font-bold text-black">Recent Check-ins</h3>

      {data.length === 0 ? (
        <p className="mt-3 text-md text-dark-grey">No check-ins yet.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {data.map((ci) => {
            const d = new Date(ci.date + "T00:00:00");
            const formatted = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            const dayName = d.toLocaleDateString("en", { weekday: "short" });
            const scoreColor = ci.score >= 80 ? "text-primary" : ci.score >= 50 ? "text-yellow" : "text-red";

            return (
              <div key={ci.date} className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2.5">
                <div className={`flex size-8 items-center justify-center rounded-md ${ci.score >= 80 ? "bg-primary-light" : ci.score >= 50 ? "bg-yellow-subtle" : "bg-red-subtle"}`}>
                  <span className={`text-base font-bold ${scoreColor}`}>{ci.score}%</span>
                </div>
                <div className="flex-1">
                  <p className="text-md font-medium text-black">{formatted}</p>
                  <p className="text-base text-dark-grey">{dayName}</p>
                </div>
                <span className="text-base text-dark-grey">{ci.answered}/{ci.total}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
