import "next-auth";

// ─── NextAuth Type Extensions ──────────────────────────────
// By default, NextAuth's Session.user only has { name, email, image }.
// We need to attach the doctor's UUID (from our doctors table) so that
// API routes can identify which doctor is making the request.
//
// This declaration merges our custom `id` field into the existing types.
// After this, `session.user.id` is available and type-safe everywhere.

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // doctors.id (UUID)
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string; // doctors.id (UUID)
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // doctors.id (UUID), set in the jwt callback
  }
}
