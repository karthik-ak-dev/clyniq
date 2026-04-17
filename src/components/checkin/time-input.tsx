"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Time Input ───────────────────────────────────────────
// iOS-style scroll wheel time picker.
// Stores value as HH:MM string in 24h format (e.g., "09:30").

interface TimeInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS = ["AM", "PM"] as const;

function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

function to24h(h: number, p: "AM" | "PM"): number {
  if (p === "AM" && h === 12) return 0;
  if (p === "PM" && h !== 12) return h + 12;
  return h;
}

// ─── Scroll Column ────────────────────────────────────────
function ScrollColumn<T extends string | number>({
  items,
  selected,
  onSelect,
  format,
}: {
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  format?: (item: T) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 44;
  const visibleItems = 5;
  const padding = Math.floor(visibleItems / 2);

  // Scroll to selected item on mount
  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx >= 0 && containerRef.current) {
      containerRef.current.scrollTop = idx * itemHeight;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const idx = Math.round(scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    if (items[clamped] !== selected) {
      onSelect(items[clamped]);
    }
  }, [items, selected, onSelect, itemHeight]);

  return (
    <div className="relative" style={{ height: itemHeight * visibleItems }}>
      {/* Selection highlight */}
      <div
        className="absolute left-0 right-0 rounded-xl bg-purple-500/15 pointer-events-none z-10"
        style={{ top: padding * itemHeight, height: itemHeight }}
      />
      {/* Fade top */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-white/60 to-transparent pointer-events-none z-20 rounded-t-xl" />
      {/* Fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white/60 to-transparent pointer-events-none z-20 rounded-b-xl" />

      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        onScroll={handleScroll}
      >
        {/* Top spacer */}
        {Array.from({ length: padding }).map((_, i) => (
          <div key={`top-${i}`} style={{ height: itemHeight }} />
        ))}

        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <div
              key={String(item)}
              className="snap-center flex items-center justify-center cursor-pointer select-none transition-all"
              style={{ height: itemHeight }}
              onClick={() => {
                onSelect(item);
                const idx = items.indexOf(item);
                containerRef.current?.scrollTo({ top: idx * itemHeight, behavior: "smooth" });
              }}
            >
              <span
                className={`text-center transition-all ${
                  isSelected
                    ? "text-2xl font-bold text-purple-700"
                    : "text-lg font-medium text-gray-400"
                }`}
              >
                {format ? format(item) : String(item)}
              </span>
            </div>
          );
        })}

        {/* Bottom spacer */}
        {Array.from({ length: padding }).map((_, i) => (
          <div key={`bot-${i}`} style={{ height: itemHeight }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export function TimeInput({ value, onChange }: TimeInputProps) {
  const parsed = value?.match(/^(\d{1,2}):(\d{2})$/);
  const initH24 = parsed ? parseInt(parsed[1]) : 9;
  const initMin = parsed ? parseInt(parsed[2]) : 0;
  const initPeriod: "AM" | "PM" = initH24 >= 12 ? "PM" : "AM";
  const initH12 = initH24 === 0 ? 12 : initH24 > 12 ? initH24 - 12 : initH24;

  const [hour, setHour] = useState(initH12);
  const [minute, setMinute] = useState(initMin);
  const [period, setPeriod] = useState<"AM" | "PM">(initPeriod);

  function emit(h: number, m: number, p: "AM" | "PM") {
    onChange(`${padTwo(to24h(h, p))}:${padTwo(m)}`);
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Display */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-bold" style={{ color: "#4c3a7a" }}>
          {padTwo(hour)}:{padTwo(minute)}
        </span>
        <span className="text-xl font-semibold" style={{ color: "#7c6b9e" }}>
          {period}
        </span>
      </div>

      {/* Scroll wheels */}
      <div
        className="flex gap-2 w-full max-w-70 rounded-2xl bg-white/70 px-2 py-1 backdrop-blur-sm"
        style={{ boxShadow: "0 4px 12px rgba(120,100,160,0.12)" }}
      >
        {/* Hour wheel */}
        <div className="flex-1">
          <ScrollColumn
            items={HOURS_12}
            selected={hour}
            onSelect={(h) => { setHour(h); emit(h, minute, period); }}
            format={padTwo}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center">
          <span className="text-2xl font-bold" style={{ color: "#7c6b9e" }}>:</span>
        </div>

        {/* Minute wheel */}
        <div className="flex-1">
          <ScrollColumn
            items={MINUTES}
            selected={minute}
            onSelect={(m) => { setMinute(m); emit(hour, m, period); }}
            format={padTwo}
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-purple-200/50 my-4" />

        {/* AM/PM wheel */}
        <div className="w-14">
          <ScrollColumn
            items={[...PERIODS]}
            selected={period}
            onSelect={(p) => { setPeriod(p as "AM" | "PM"); emit(hour, minute, p as "AM" | "PM"); }}
          />
        </div>
      </div>
    </div>
  );
}
