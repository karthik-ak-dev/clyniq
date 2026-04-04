import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";

// ─── NextAuth API Route Handler ────────────────────────────
// This catch-all route handles all NextAuth endpoints:
//   POST /api/auth/signin       — sign in with credentials
//   POST /api/auth/signout      — clear session
//   GET  /api/auth/session      — fetch current session
//   GET  /api/auth/csrf         — get CSRF token
//   GET  /api/auth/providers    — list available providers
//
// Configuration is centralized in lib/auth/config.ts.
// This file is intentionally thin — it just wires NextAuth to the App Router.

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
