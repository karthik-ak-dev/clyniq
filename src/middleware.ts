import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ─── Route Protection Middleware ───────────────────────────
// Protects doctor-facing routes by checking for a valid NextAuth JWT.
// Unauthenticated requests to protected routes are redirected to /login.
//
// Protected routes (require doctor login):
//   /dashboard, /patients/*, /settings — all dashboard pages
//   /api/patients/*, /api/templates/*, /api/compliance/* — doctor APIs
//
// Public routes (NOT matched, freely accessible):
//   /login                — auth pages
//   /p/*                  — patient magic link pages
//   /api/auth/*           — NextAuth endpoints (must be public for login to work)
//   /api/checkin          — patient check-in submission (token-based)
//   /api/p/*              — patient context fetch (token-based)
//   /api/reminders/*      — cron-triggered (secured by cron secret)

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    // API routes get a 401 JSON response
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Page routes get redirected to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/templates/:path*",
    "/api/patients/:path*",
    "/api/templates/:path*",
    "/api/compliance/:path*",
  ],
};
