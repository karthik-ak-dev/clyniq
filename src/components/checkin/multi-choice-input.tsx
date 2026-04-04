"use client";

// ─── Multi-Choice Input ────────────────────────────────────
// Checkbox list for multi_choice questions.
// Matched to ref_1 screen 3: rows with checkboxes, multiple selectable.
// Purple checkbox when checked.
//
// Usage:
//   <MultiChoiceInput
//     options={["Dizziness", "Fatigue", "None"]}
//     value={["Fatigue"]}
//     onChange={(v) => setResponse(v)}
//   />

interface MultiChoiceInputProps {
  options: string[];
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export function MultiChoiceInput({
  options,
  value = [],
  onChange,
}: MultiChoiceInputProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((option) => {
        const isSelected = value.includes(option);
        return (
          <button
            key={option}
            onClick={() => toggleOption(option)}
            className={`checkbox-option ${isSelected ? "checkbox-option-selected" : ""}`}
          >
            <span
              className={`checkbox-box ${isSelected ? "checkbox-box-checked" : ""}`}
            >
              {isSelected && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}
