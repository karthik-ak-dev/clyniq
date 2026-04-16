// ─── Shared Display Helpers ────────────────────────────────
// Centralized formatting functions used across dashboard
// components. Import from "@/lib/utils/format-helpers".
//
// These are pure display/formatting functions — no business
// logic, no scoring, no DB access.

import type { TemplateQuestion } from "@/lib/db/types";

/**
 * Format a question response value for display.
 * Used in checkin-calendar modal and last-checkin-detail list.
 */
export function formatQuestionValue(q: TemplateQuestion, val: unknown): string {
  if (val === undefined || val === null || val === "") return "—";
  if (q.type === "yes_no") return val === true ? "Yes" : "No";
  if (q.type === "multi_choice" && Array.isArray(val)) return val.length > 0 ? val.join(", ") : "—";
  if (q.type === "number" && q.unit) return `${val} ${q.unit}`;
  if (q.type === "bp") return String(val);
  return String(val);
}

/**
 * Shorten a question label for compact display.
 * Strips common prefixes like "Did you", "What was your", etc.
 */
export function shortQuestionLabel(label: string): string {
  return label
    .replace(/\?$/, "")
    .replace(/^Did you /, "")
    .replace(/^What was your /, "")
    .replace(/^What's your /, "")
    .replace(/^What time did you /, "")
    .replace(/^How was your /, "")
    .replace(/^How are you /, "")
    .replace(/^How many /, "")
    .replace(/^Any /, "")
    .replace(/ today$/, "");
}

/**
 * Categorize a question by its label for compliance breakdown grouping.
 */
export function categorizeQuestion(_key: string, label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("medicine") || lower.includes("insulin") || lower.includes("medication")) return "Medication";
  if (lower.includes("diet") || lower.includes("exercise") || lower.includes("water") || lower.includes("snack") || lower.includes("portion") || lower.includes("alcohol") || lower.includes("sleep") || lower.includes("sugary")) return "Lifestyle";
  if (lower.includes("blood sugar") || lower.includes("weight") || lower.includes("pressure") || lower.includes("feet") || lower.includes("foot") || lower.includes("monitor")) return "Monitoring";
  return "Other";
}

/**
 * Clean a metric label for health metrics cards.
 * Strips question-style prefixes.
 */
export function cleanMetricLabel(label: string): string {
  return label
    .replace(/\?$/, "")
    .replace(/^What was your /, "")
    .replace(/^What's your /, "")
    .replace(/^What is your /, "")
    .replace(/^How many /, "");
}

/**
 * Calculate age from date of birth string (YYYY-MM-DD).
 */
export function calculateAge(dob: string): number | null {
  const birthDate = new Date(dob + "T00:00:00");
  const today = new Date();
  if (birthDate > today) return null;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Format a date of birth for display (e.g., "7 April 2026").
 */
export function formatDOB(dob: string): string {
  return new Date(dob + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a date string for short display (e.g., "15 Apr 2026").
 */
export function formatDateShort(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date string for long display (e.g., "15 April 2026").
 */
export function formatDateLong(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
