"use client";

import { useState } from "react";
import type { TemplateQuestion, CalendarEntry } from "@/lib/db/types";
import { formatQuestionValue, shortQuestionLabel } from "@/lib/utils/format-helpers";

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

export function CheckinCalendar({ calendarData, allQuestions, enabledQuestions }: {
  calendarData: Record<string, CalendarEntry>;
  allQuestions: TemplateQuestion[];
  enabledQuestions: string[];
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const prevMonth = () => { setViewDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
  const nextMonth = () => { setViewDate(new Date(year, month + 1, 1)); setSelectedDate(null); };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Get day style based on compliance score
  function getDayStyle(dateStr: string): string {
    const entry = calendarData[dateStr];
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;

    if (!entry) {
      // No check-in
      if (isToday) return "ring-1 ring-primary text-black font-medium";
      return "text-dark-grey hover:bg-surface cursor-default";
    }

    // Has check-in — color by score
    const base = isSelected ? "ring-2 ring-primary-dark" : "";
    if (entry.score >= 80) return `bg-primary text-white font-medium cursor-pointer ${base}`;
    if (entry.score >= 50) return `bg-yellow text-white font-medium cursor-pointer ${base}`;
    return `bg-red text-white font-medium cursor-pointer ${base}`;
  }

  // Selected day's data
  const selectedEntry = selectedDate ? calendarData[selectedDate] : null;
  const enabledSet = new Set(enabledQuestions);
  const activeQuestions = allQuestions.filter((q) => enabledSet.has(q.key));

  return (
    <>
    <div className="rounded-xl bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-black tracking-tighter">{monthName}</h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="flex size-7 items-center justify-center rounded-md bg-surface text-dark-grey hover:bg-border transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 9L4.5 6l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={nextMonth} className="flex size-7 items-center justify-center rounded-md bg-surface text-dark-grey hover:bg-border transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-3 text-2xs text-dark-grey">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary" /> Good</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-yellow" /> Okay</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red" /> Low</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-border" /> Missed</span>
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

          // Only allow clicking on today or past days
          const isPastOrToday = dateStr <= todayStr;

          return (
            <button
              key={i}
              type="button"
              onClick={() => isPastOrToday ? setSelectedDate(dateStr === selectedDate ? null : dateStr) : null}
              className={`flex items-center justify-center rounded-md py-1.5 text-base transition-colors ${getDayStyle(dateStr)} ${isPastOrToday ? "cursor-pointer" : "cursor-default"}`}
            >
              {day}
            </button>
          );
        })}
      </div>

    </div>

    {/* ── Modal Overlay ───────────────────────────── */}
    {selectedDate && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedDate(null)}>
        <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-black tracking-tighter">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              {selectedEntry ? (
                <p className="mt-0.5 text-md text-dark-grey">
                  Compliance: <span className={`font-bold ${selectedEntry.score >= 80 ? "text-primary" : selectedEntry.score >= 50 ? "text-yellow" : "text-red"}`}>{selectedEntry.score}%</span>
                </p>
              ) : (
                <p className="mt-0.5 text-md text-dark-grey">No check-in recorded for this day</p>
              )}
            </div>
            <button onClick={() => setSelectedDate(null)} className="flex size-8 items-center justify-center rounded-md bg-surface text-dark-grey hover:text-black hover:bg-border transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Questions & Answers */}
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {activeQuestions.map((q) => {
                const val = selectedEntry?.responses[q.key];
                const display = selectedEntry ? formatQuestionValue(q, val) : null;
                const noResponse = !selectedEntry || val === undefined || val === null;

                return (
                  <div key={q.key} className="flex items-center justify-between rounded-lg px-3 py-2.5 odd:bg-surface">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="size-1.5 shrink-0 rounded-full bg-dark-grey" />
                      <span className="text-md text-black truncate">{shortQuestionLabel(q.label)}</span>
                    </div>
                    <span className={`shrink-0 ml-3 text-md font-medium ${noResponse ? "text-light-grey" : "text-black"}`}>
                      {noResponse ? "Not answered" : display}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
