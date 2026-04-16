// ─── Barrel Export ─────────────────────────────────────────
// Single import point for all validators:
//   import { createPatientSchema, checkinSchema } from "@/lib/validators";

export { createPatientSchema } from "./patient";
export type { CreatePatientInput } from "./patient";

export { checkinSchema } from "./checkin";
export type { CheckinInput } from "./checkin";

export { createVisitSchema } from "./visit";
export type { CreateVisitInput } from "./visit";
