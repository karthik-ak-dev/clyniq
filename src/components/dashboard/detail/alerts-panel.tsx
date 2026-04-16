export function AlertsPanel({ insights }: { insights: string[] }) {
  const bg = insights.length === 0 ? "bg-primary-subtle" : "bg-yellow-subtle";

  return (
    <div className={`flex h-36 flex-col rounded-xl ${bg} p-4`}>
      <h3 className="text-2xl font-bold text-black tracking-tighter shrink-0">Alerts & Insights</h3>
      <div className="mt-2 flex flex-col gap-2 overflow-y-auto min-h-0">
        {insights.length === 0 ? (
          <div className="flex items-start gap-2 text-md">
            <span className="mt-0.5 text-primary shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 .583A6.417 6.417 0 1 0 13.417 7 6.424 6.424 0 0 0 7 .583Zm0 9.917a.583.583 0 1 1 0-1.167.583.583 0 0 1 0 1.167Zm.583-3.5a.583.583 0 0 1-1.166 0V4.083a.583.583 0 0 1 1.166 0V7Z" fill="currentColor"/></svg>
            </span>
            <span className="text-dark-grey">No alerts. Patient compliance is on track.</span>
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-md shrink-0">
              <span className="mt-0.5 text-yellow shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.167L.583 12.25h12.834L7 1.167ZM7 5.25v2.333M7 9.917h.006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span className="text-black">{insight}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
