"use client";

// ─── Yes/No Input ──────────────────────────────────────────
// Full-width pill rows for yes_no questions.
// Matched to ref_1 screen 2 & ref_2: each option is a white/frosted
// pill spanning full width. Selected gets purple border + arrow.
// Sits directly on gradient background — no card container.

interface YesNoInputProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export function YesNoInput({ value, onChange }: YesNoInputProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={() => onChange(true)}
        className={`option-pill ${value === true ? "option-pill-selected" : ""}`}
      >
        <span className="flex-1">Yes</span>
        {value === true && <span>→</span>}
      </button>
      <button
        onClick={() => onChange(false)}
        className={`option-pill ${value === false ? "option-pill-selected" : ""}`}
      >
        <span className="flex-1">No</span>
        {value === false && <span>→</span>}
      </button>
    </div>
  );
}
