// ─── Barrel Export ─────────────────────────────────────────
// Single import point for all query modules:
//   import { patientQueries, checkinQueries } from "@/lib/db/queries";

export { doctorQueries } from "./doctors";
export { patientQueries } from "./patients";
export { templateQueries } from "./templates";
export { checkinQueries } from "./checkins";
export { complianceQueries } from "./compliance";
export { reminderQueries } from "./reminders";
export { visitQueries } from "./visits";
