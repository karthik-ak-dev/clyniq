// ─── API Client ────────────────────────────────────────────
// Central fetch wrapper for doctor-authenticated API calls.
// Handles 401 → redirect to login automatically.
// Used by all dashboard pages instead of raw fetch().
//
// Usage:
//   const data = await apiFetch("/api/patients");
//   if (!data) return; // redirected to login
//
// This prevents the "empty dashboard with no data" problem
// when the session has expired.

export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  const res = await fetch(url, options);

  // Session expired or invalid — redirect to login
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || "Request failed");
  }

  return json.data as T;
}
