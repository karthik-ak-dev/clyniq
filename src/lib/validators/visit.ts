import { z } from "zod";
import { FREQUENCY } from "@/lib/db/types";

export const prescriptionRowSchema = z.object({
  medicineName: z.string().min(1).max(255),
  dosage: z.string().max(100).optional(),
  frequency: z
    .enum([FREQUENCY.OD, FREQUENCY.BD, FREQUENCY.TID, FREQUENCY.QID, FREQUENCY.SOS])
    .optional(),
  duration: z.string().max(50).optional(),
  instructions: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const createVisitSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD format"),
  chiefComplaint: z.string().max(1000).optional(),
  diagnosis: z.string().max(1000).optional(),
  vitalsBp: z
    .string()
    .regex(/^\d{2,3}\/\d{2,3}$/, "Format: 120/80")
    .optional(),
  vitalsTemp: z.string().max(10).optional(),
  vitalsWeight: z.string().max(10).optional(),
  vitalsPulse: z.string().max(10).optional(),
  investigations: z.string().max(1000).optional(),
  notes: z.string().max(5000).optional(),
  followUpDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  prescriptions: z.array(prescriptionRowSchema).default([]),
});
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
