// ─── Shared Utilities ─────────────────────────────────────

// Get today's date as YYYY-MM-DD in UTC.
// Used consistently across check-in API, compliance queries, etc.
export function getTodayUTC(): string {
  return new Date().toISOString().split("T")[0];
}
