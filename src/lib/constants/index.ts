// ─── Shared Constants ──────────────────────────────────────
// UI-level constants used across dashboard components.
// Import from "@/lib/constants".

export const VISIT_TYPE_LABELS: Record<string, string> = {
  initial: "Initial Consultation",
  checkup: "Regular Checkup",
  followup: "Follow-up",
  emergency: "Emergency",
};

export const VISIT_TYPE_COLORS: Record<string, string> = {
  initial: "bg-primary-light text-primary-dark",
  checkup: "bg-primary-light text-primary-dark",
  followup: "bg-yellow-subtle text-yellow",
  emergency: "bg-red-subtle text-red",
};
