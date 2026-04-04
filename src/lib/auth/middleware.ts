import { getServerSession } from "next-auth";
import { authOptions } from "./config";
import { db } from "@/lib/db";
import { doctors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Doctor } from "@/lib/db/types";

// ─── Auth Middleware Helper ────────────────────────────────
// Extracts and validates the authenticated doctor from the current
// request session. Used at the top of every protected API route.
//
// Usage:
//   const doctor = await getAuthenticatedDoctor();
//   if (!doctor) return Response.json({ ... }, { status: 401 });
//
// Returns the full Doctor row from the database (not just JWT claims),
// so the caller has access to all doctor fields (name, email, etc.).
// Returns null if the session is invalid or the doctor no longer exists.

export async function getAuthenticatedDoctor(): Promise<Doctor | null> {
  const session = await getServerSession(authOptions);

  // No session or no user ID in token — not authenticated
  if (!session?.user?.id) {
    return null;
  }

  // Fetch the full doctor record from DB.
  // This ensures the doctor still exists (hasn't been deleted since JWT was issued).
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.id, session.user.id))
    .limit(1);

  return doctor ?? null;
}
