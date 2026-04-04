"use client";

import { useState } from "react";
import type { TemplateQuestion } from "@/lib/db/types";
import { QuestionRenderer } from "./question-renderer";
import { CheckinConfirmation } from "./checkin-confirmation";

// ─── Check-in Flow Orchestrator ────────────────────────────
// Steps through questions one at a time, collects responses,
// submits to POST /api/checkin, shows confirmation.
//
// Layout: h-dvh, no scroll. Back arrow top-left, question in
// frosted card center, nav button bottom center.
//
// Background: questionnaire bg (set by parent PageShell).

interface CheckinFlowProps {
  questions: TemplateQuestion[];
  token: string;
  patientName: string;
  onBack: () => void; // Returns to landing page
}

export function CheckinFlow({
  questions,
  token,
  patientName,
  onBack,
}: CheckinFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<
    Record<string, boolean | number | string | string[]>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentValue = currentQuestion
    ? responses[currentQuestion.key]
    : undefined;

  // Check if current question has an answer (to enable/disable Next)
  const hasAnswer = currentValue !== undefined && currentValue !== null &&
    (Array.isArray(currentValue) ? currentValue.length > 0 : true);

  const updateResponse = (value: boolean | number | string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  };

  const goNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (currentIndex === 0) {
      onBack();
    } else {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, responses }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to submit. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // ─── Confirmation Screen ───────────────────────────────
  if (submitted) {
    return <CheckinConfirmation patientName={patientName} />;
  }

  // ─── Question Screen ──────────────────────────────────
  return (
    <div className="flex-1 flex flex-col">
      {/* Top bar: back button + progress */}
      <div className="flex items-center justify-between px-5 pt-6">
        <button onClick={goBack} className="btn-back">
          ←
        </button>
        <span className="text-sm font-medium" style={{ color: "#8b5cf6" }}>
          {currentIndex + 1} / {questions.length}
        </span>
        {/* Spacer for alignment */}
        <div className="w-10" />
      </div>

      {/* Question content — scrollable when options overflow */}
      <div className="flex-1 px-6 pt-6 pb-4 overflow-y-auto min-h-0">
        <QuestionRenderer
          question={currentQuestion}
          value={currentValue}
          onChange={updateResponse}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm text-center px-5 pb-2">{error}</p>
      )}

      {/* Nav button — bottom center */}
      <div className="px-8 pb-10">
        <div className={`btn-cta-wrapper ${!hasAnswer ? "disabled" : ""}`}>
          <button
            onClick={goNext}
            disabled={!hasAnswer || submitting}
            className="btn-cta-face"
          >
            {submitting
              ? "Submitting..."
              : isLastQuestion
                ? "Submit"
                : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
