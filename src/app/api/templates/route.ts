import { NextRequest } from "next/server";
import { getAuthenticatedDoctor } from "@/lib/auth/middleware";
import { templateQueries } from "@/lib/db/queries";
import type { Condition } from "@/lib/db/types";

// ─── GET /api/templates?condition=diabetes ──────────────────
// List all tracking templates for a given condition.
// Returns the full question definitions so the UI can render
// toggle switches for the doctor to enable/disable questions.
//
// Query params:
//   condition — "diabetes" or "obesity" (required)
//
// In MVP this returns just the default template per condition.
// Future: may include custom templates created by the doctor.
export async function GET(request: NextRequest) {
  const doctor = await getAuthenticatedDoctor();
  if (!doctor) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const condition = request.nextUrl.searchParams.get("condition");
  if (!condition || !["diabetes", "obesity"].includes(condition)) {
    return Response.json(
      { success: false, error: "Valid condition is required (diabetes or obesity)" },
      { status: 400 }
    );
  }

  try {
    const data = await templateQueries.listByCondition(
      condition as Condition
    );
    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
