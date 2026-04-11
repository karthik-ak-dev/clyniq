"use client";

import { useState } from "react";

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

export function CheckinCalendar({ checkinDates }: { checkinDates: string[] }) {
  const [viewDate, setViewDate] = useState(new Date());
  const checkinSet = new Set(checkinDates);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en", { month: "long", year: "numeric" });

  // First day of month (0 = Sunday)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="rounded-xl bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-black">{monthName}</h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="flex size-7 items-center justify-center rounded-md bg-surface text-dark-grey hover:bg-border transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 9L4.5 6l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={nextMonth} className="flex size-7 items-center justify-center rounded-md bg-surface text-dark-grey hover:bg-border transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {DAY_NAMES.map((d, i) => (
          <div key={i} className="text-center text-base text-dark-grey py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={i} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasCheckin = checkinSet.has(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={i}
              className={`flex items-center justify-center rounded-md py-1.5 text-base transition-colors ${
                hasCheckin
                  ? "bg-primary text-white font-medium"
                  : isToday
                    ? "ring-1 ring-primary text-black font-medium"
                    : "text-dark-grey"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
