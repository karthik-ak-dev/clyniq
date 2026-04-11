export function AlertsPanel({ insights }: { insights: string[] }) {
  return (
    <div className="rounded-xl bg-yellow-subtle p-4">
      <h3 className="text-md font-bold text-black">Alerts & Insights</h3>
      <div className="mt-2 flex flex-col gap-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-md">
            <span className="mt-0.5 text-yellow">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.167L.583 12.25h12.834L7 1.167ZM7 5.25v2.333M7 9.917h.006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="text-black">{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
