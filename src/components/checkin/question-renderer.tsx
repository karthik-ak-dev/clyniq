"use client";

import type { TemplateQuestion } from "@/lib/db/types";
import { YesNoInput } from "./yes-no-input";
import { ChoiceInput } from "./choice-input";
import { MultiChoiceInput } from "./multi-choice-input";
import { NumberInput } from "./number-input";
import { TimeInput } from "./time-input";
import { BpInput } from "./bp-input";

// ─── Question Renderer ─────────────────────────────────────
// Dispatches to the correct input component based on question type.
// Handles all 8 question types: yes_no, choice, multi_choice,
// number, text, scale, time, bp.

interface QuestionRendererProps {
  question: TemplateQuestion;
  value: boolean | number | string | string[] | undefined;
  onChange: (value: boolean | number | string | string[]) => void;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
}: QuestionRendererProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Question label */}
      <h2 className="text-center" style={{ fontSize: "1.6rem", fontWeight: 700, color: "#4c3a7a", lineHeight: 1.3 }}>
        {question.label}
      </h2>

      {/* Type-specific input */}
      {question.type === "yes_no" && (
        <YesNoInput
          value={value as boolean | undefined}
          onChange={onChange}
        />
      )}

      {question.type === "choice" && question.options && (
        <ChoiceInput
          options={question.options}
          value={value as string | undefined}
          onChange={onChange}
        />
      )}

      {question.type === "multi_choice" && question.options && (
        <MultiChoiceInput
          options={question.options}
          value={value as string[] | undefined}
          onChange={onChange}
        />
      )}

      {question.type === "number" && (
        <NumberInput
          value={value as number | undefined}
          unit={question.unit}
          onChange={onChange}
        />
      )}

      {question.type === "text" && (
        <textarea
          className="w-full px-5 py-4 rounded-2xl bg-white/85 text-gray-800 placeholder-purple-300/70 outline-none border-[1.5px] border-purple-200/50 focus:border-purple-400 resize-none"
          style={{ minHeight: "8rem", fontSize: "1.1rem", fontWeight: 500, lineHeight: 1.6, boxShadow: "0 3px 0 rgba(180,160,210,0.2)" }}
          placeholder="Type your answer..."
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "scale" && (
        <div className="flex gap-2 justify-center flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`w-11 h-11 rounded-full text-sm font-semibold transition-all ${
                value === n
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-white/85 text-gray-600 border-[1.5px] border-purple-200/50"
              }`}
              style={{ boxShadow: value === n ? undefined : "0 2px 0 rgba(180,160,210,0.2)" }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {question.type === "time" && (
        <TimeInput
          value={value as string | undefined}
          onChange={onChange}
        />
      )}

      {question.type === "bp" && (
        <BpInput
          value={value as string | undefined}
          onChange={onChange}
        />
      )}
    </div>
  );
}
