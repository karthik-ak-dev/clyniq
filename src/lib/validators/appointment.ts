import { z } from "zod";
import { GENDER, QUESTIONNAIRE_DURATION } from "@/lib/db/types";

const phoneRegex = /^\+91\d{10}$/;

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM format"),
  patient: z.object({
    name: z.string().min(2).max(255),
    phone: z.string().regex(phoneRegex, "Must be +91XXXXXXXXXX"),
    age: z.number().int().min(0).max(150).optional(),
    gender: z.enum([GENDER.MALE, GENDER.FEMALE, GENDER.OTHER]).optional(),
  }),
  razorpayPaymentId: z.string().min(1),
});
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;

export const questionnaireSchema = z.object({
  appointmentId: z.string().uuid(),
  chiefComplaint: z.string().min(1).max(1000),
  duration: z.enum([
    QUESTIONNAIRE_DURATION.TODAY,
    QUESTIONNAIRE_DURATION.FEW_DAYS,
    QUESTIONNAIRE_DURATION.A_WEEK,
    QUESTIONNAIRE_DURATION.MORE_THAN_WEEK,
    QUESTIONNAIRE_DURATION.ONGOING,
  ]),
  severity: z.number().int().min(1).max(10),
  existingConditions: z.array(z.string()).default([]),
  currentMedications: z.string().max(1000).optional(),
  allergies: z.string().max(1000).optional(),
  previousSurgeries: z.string().max(1000).optional(),
  additionalNotes: z.string().max(2000).optional(),
});
export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(["completed", "cancelled", "no_show"]),
});
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const getSlotsSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD format"),
});
export type GetSlotsInput = z.infer<typeof getSlotsSchema>;
