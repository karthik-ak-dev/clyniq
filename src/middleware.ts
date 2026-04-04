export { default } from "next-auth/middleware";

// ─── Route Protection Middleware ───────────────────────────
// Uses NextAuth's built-in middleware to protect routes.
// Any route matching the `matcher` patterns below requires a valid
// session — unauthenticated requests are redirected to /login.
//
// Protected routes (require doctor login):
//   /dashboard, /patients/*, /settings — all dashboard pages
//   /api/patients/*, /api/templates/*, /api/compliance/* — doctor APIs
//
// Public routes (NOT matched, freely accessible):
//   /login                — auth pages
//   /p/*                  — patient magic link pages
//   /api/auth/*           — NextAuth endpoints (must be public for login to work)
//   /api/checkin          — patient check-in submission (token-based, not session-based)
//   /api/p/*              — patient context fetch (token-based)
//   /api/reminders/*      — cron-triggered (secured by cron secret, not session)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/settings/:path*",
    "/api/patients/:path*",
    "/api/templates/:path*",
    "/api/compliance/:path*",
  ],
};
