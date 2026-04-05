import { redirect } from "next/navigation";

// ─── Root Page ─────────────────────────────────────────────
// Redirects to dashboard. If not authenticated, the middleware
// will redirect to /login automatically.

export default function RootPage() {
  redirect("/dashboard");
}
