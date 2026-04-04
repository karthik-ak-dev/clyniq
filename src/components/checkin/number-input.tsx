"use client";

// ─── Number Input ──────────────────────────────────────────
// Large centered numeric input for number questions.
// Matched to ref_2 "weight" screen: big number display + unit label.
//
// Usage:
//   <NumberInput value={72.5} unit="kg" onChange={(v) => setResponse(v)} />

interface NumberInputProps {
  value: number | undefined;
  unit?: string;
  onChange: (value: number) => void;
}

export function NumberInput({ value, unit, onChange }: NumberInputProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <input
        type="number"
        inputMode="decimal"
        className="number-input"
        placeholder="0"
        value={value ?? ""}
        onChange={(e) => {
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) onChange(num);
        }}
      />
      {unit && (
        <span style={{ fontSize: "1rem", fontWeight: 500, color: "#6b7280" }}>{unit}</span>
      )}
    </div>
  );
}
