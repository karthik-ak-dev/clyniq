"use client";

// ─── Choice Input ──────────────────────────────────────────
// Single-select option pills for choice questions.
// Matched to ref_1 screen 2: vertical list of full-width frosted pills.
// Selected option gets purple border + arrow on right.
// Sits directly on gradient background.

interface ChoiceInputProps {
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export function ChoiceInput({ options, value, onChange }: ChoiceInputProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`option-pill ${isSelected ? "option-pill-selected" : ""}`}
          >
            <span className="flex-1">{option}</span>
            {isSelected && <span>→</span>}
          </button>
        );
      })}
    </div>
  );
}
