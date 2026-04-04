// ─── Barrel Export ─────────────────────────────────────────
// Single import point for all validators:
//   import { createPatientSchema, checkinSchema } from "@/lib/validators";

export { createPatientSchema, assignTemplateSchema } from "./patient";
export type { CreatePatientInput, AssignTemplateInput } from "./patient";

export { checkinSchema } from "./checkin";
export type { CheckinInput } from "./checkin";
