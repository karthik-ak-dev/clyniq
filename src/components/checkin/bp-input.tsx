"use client";

import { useState } from "react";

// ─── Blood Pressure Input ─────────────────────────────────
// Dual input for systolic/diastolic blood pressure.
// Stores value as "SYS/DIA" string (e.g., "120/80").

interface BpInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function BpInput({ value, onChange }: BpInputProps) {
  const parts = value?.split("/") ?? ["", ""];
  const [systolic, setSystolic] = useState(parts[0] ?? "");
  const [diastolic, setDiastolic] = useState(parts[1] ?? "");

  const handleSystolic = (val: string) => {
    const clean = val.replace(/\D/g, "");
    setSystolic(clean);
    if (clean && diastolic) onChange(`${clean}/${diastolic}`);
  };

  const handleDiastolic = (val: string) => {
    const clean = val.replace(/\D/g, "");
    setDiastolic(clean);
    if (systolic && clean) onChange(`${systolic}/${clean}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-3 w-full max-w-xs">
        <div className="flex-1 flex flex-col items-center gap-1">
          <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#6b7280" }}>Systolic</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="120"
            className="w-full p-4 rounded-2xl bg-white/85 text-center text-xl font-semibold text-gray-800 outline-none border-[1.5px] border-purple-200/50 focus:border-purple-400"
            style={{ boxShadow: "0 3px 0 rgba(180,160,210,0.2)" }}
            value={systolic}
            onChange={(e) => handleSystolic(e.target.value)}
          />
        </div>
        <span className="text-2xl font-bold text-gray-400 mt-5">/</span>
        <div className="flex-1 flex flex-col items-center gap-1">
          <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#6b7280" }}>Diastolic</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="80"
            className="w-full p-4 rounded-2xl bg-white/85 text-center text-xl font-semibold text-gray-800 outline-none border-[1.5px] border-purple-200/50 focus:border-purple-400"
            style={{ boxShadow: "0 3px 0 rgba(180,160,210,0.2)" }}
            value={diastolic}
            onChange={(e) => handleDiastolic(e.target.value)}
          />
        </div>
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#6b7280" }}>mmHg</span>
    </div>
  );
}
