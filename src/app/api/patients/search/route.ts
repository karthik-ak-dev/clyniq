import { NextRequest } from "next/server";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { patientQueries } from "@/lib/db/queries";

// ─── GET /api/patients/search?q=query ──────────────────────
// Search patients by name or phone number for the authenticated doctor.
// Case-insensitive partial match (ILIKE %query%).
//
// Query params:
//   q — search string (required, min 1 char)
//
// Returns: Array of { patient, doctorPatient } matching the query.
// Used by the dashboard search bar for real-time filtering.
export async function GET(request: NextRequest) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.trim().length === 0) {
    return Response.json(
      { success: false, error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const data = await patientQueries.search(doctor.id, query.trim());
    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
